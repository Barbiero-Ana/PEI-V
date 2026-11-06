# Carregar por dot-sourcing, na raiz do repositorio. Nenhuma fase roda ao carregar.
# A sessao existente deve estar em $cabecalhosTeste. Nao usar em producao.
# Preparacao padrao: DATABASE_URL de apps/api/.env, sem redigitar conexao.
# -ConexaoLocal e uma substituicao explicita opcional; nunca corrige URL invalida.

function Get-ModolumeProcessoApi {
    param([string] $Raiz, [string[]] $Arquivos)

    $etapaProcesso = 'PROCESSO_PORTA'
    try {
    $idsApi = @(
        Get-NetTCPConnection -LocalPort 3333 -State Listen -ErrorAction Stop |
            Select-Object -ExpandProperty OwningProcess -Unique
    )
    if ($idsApi.Count -ne 1) { throw 'Processo ambiguo ou ausente.' }
    $etapaProcesso = 'PROCESSO_COMANDO'
    $processo = Get-CimInstance Win32_Process `
        -Filter "ProcessId = $($idsApi[0])" -ErrorAction Stop
    $etapaProcesso = 'PROCESSO_EXECUTAVEL'
    if (-not $processo -or $processo.Name -ne 'node.exe' -or
        -not $processo.CreationDate) { throw 'Processo indisponivel.' }
    $etapaProcesso = 'PROCESSO_CAMINHO'
    # Compara o checkout completo como diretorio, aceitando / ou \ no comando.
    # Nao depende de regex nem aceita outra pasta com o mesmo prefixo.
    $raizNormalizada = [IO.Path]::GetFullPath($Raiz).Replace('/', '\').TrimEnd([char[]]'\/')
    $comandoNormalizado = ([string]$processo.CommandLine).Replace('/', '\')
    if ([string]::IsNullOrWhiteSpace($raizNormalizada) -or
        $comandoNormalizado.IndexOf($raizNormalizada + '\', [StringComparison]::OrdinalIgnoreCase) -lt 0) {
        throw 'Checkout divergente.'
    }
    $etapaProcesso = 'PROCESSO_COMANDO'
    if (
        $processo.CommandLine -notmatch 'src[\\/]main\.ts(?:["\s]|$)' -or
        $processo.CommandLine -notmatch 'tsx') {
        throw 'Processo nao corresponde ao checkout esperado.'
    }
    $etapaProcesso = 'PROCESSO_HORARIO'
    foreach ($arquivo in $Arquivos) {
        if ($processo.CreationDate -lt (Get-Item -LiteralPath $arquivo -ErrorAction Stop).LastWriteTime) {
            throw 'Processo anterior ao codigo inspecionado.'
        }
    }
    # Linha de comando nao e exibida nem devolvida.
    $sha = [Security.Cryptography.SHA256]::Create()
    try {
        $assinatura = [BitConverter]::ToString(
            $sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($processo.CommandLine))
        )
    }
    finally { $sha.Dispose() }
    [pscustomobject]@{
        Id = $processo.ProcessId
        Inicio = $processo.CreationDate
        ComandoHash = $assinatura
    }
    }
    catch {
        $_.Exception.Data['EtapaHomologacao'] = $etapaProcesso
        throw
    }
}

function Test-ModolumeProcessoIgual {
    param($Antes, $Depois)
    $Antes.Id -eq $Depois.Id -and $Antes.Inicio -eq $Depois.Inicio -and
        $Antes.ComandoHash -eq $Depois.ComandoHash
}

function Testar-ModolumePreparacao {
    param([Security.SecureString] $ConexaoLocal)

    $ErrorActionPreference = 'Stop'
    $etapa = 'AUTENTICACAO_CABECALHO'
    $diagnosticoNode = $null
    $ambienteAnterior = [Environment]::GetEnvironmentVariable('MODOLUME_HOMOLOGACAO_DB', 'Process')
    try {
        $script:ModolumePreparado = $null
        if (-not $cabecalhosTeste -or
            [string]$cabecalhosTeste['Authorization'] -notmatch '^Bearer\s+\S+$') {
            throw 'Autenticacao ausente.'
        }
        $etapa = 'BRANCH'
        $branch = & git branch --show-current 2>$null
        if ($LASTEXITCODE -ne 0 -or $branch.Trim() -ne 'feat/backend-guilherme') {
            throw 'Branch incorreta.'
        }
        $raiz = (Get-Location).Path
        $etapa = 'ARQUIVOS_HASH'
        $arquivos = @('apps/api/src/professor.ts', 'packages/core/src/planejamento.ts')
        $hashes = @{}
        foreach ($arquivo in $arquivos) {
            $hashes[$arquivo] = (Get-FileHash -LiteralPath $arquivo -Algorithm SHA256).Hash
        }
        $etapa = 'CODIGO_PROTECAO'
        $fonte = Get-Content -LiteralPath $arquivos[0] -Raw -Encoding UTF8
        if ($fonte -notmatch (
                '(?s)async editarPlano\(.*?await this\.planoDoProfessor\(eu, id\);.*?' +
                'await this\.filhasDoPlano\(eu, d\);.*?this\.banco\.planoAula\.update'
            ) -or $fonte -notmatch (
                '(?s)private async planoDoProfessor\(eu: Equipe, id: string\).*?' +
                'await this\.conferirTurmas\(eu, \[p\.turmaId\]\);'
            )) { throw 'Protecao nao identificada.' }

        $etapa = 'PROCESSO_INICIAL'
        $processoAntes = Get-ModolumeProcessoApi -Raiz $raiz -Arquivos $arquivos
        # Somente GET. O operador deve ter confirmado API e SELECT no mesmo banco local.
        $etapa = 'AUTENTICACAO_GET'
        $eu = Invoke-RestMethod -Uri 'http://127.0.0.1:3333/auth/eu' `
            -Method Get -Headers $cabecalhosTeste -MaximumRedirection 0 -TimeoutSec 15
        $etapa = 'AUTENTICACAO_PERFIL'
        if (-not $eu.id -or -not $eu.instituicao.id -or
            $eu.senhaProvisoria -isnot [bool] -or
            $eu.papel -ne 'professor' -or $eu.senhaProvisoria -ne $false) {
            throw 'Sessao inadequada.'
        }

        $etapa = 'CONEXAO_PREPARACAO'
        $conexao = $null
        if ($null -ne $ConexaoLocal) {
            $conexao = [Net.NetworkCredential]::new('', $ConexaoLocal).Password
            if ([string]::IsNullOrWhiteSpace($conexao)) { throw 'Substituicao vazia.' }
        }
        # Limpa uma variavel de ambiente antiga durante a preparacao padrao.
        # O finally restaura exatamente o valor que existia antes.
        [Environment]::SetEnvironmentVariable('MODOLUME_HOMOLOGACAO_DB', $conexao, 'Process')
        $codigoNode = @'
const path = require("node:path");
const Module = require("node:module");
(async () => {
  let prisma;
  let etapa = 'DEPENDENCIAS_PRISMA';
  try {
    const { PrismaClient } = require("@prisma/client");
    etapa = 'CONFIGURACAO_LOCAL';
    const substituicao = process.env.MODOLUME_HOMOLOGACAO_DB;
    // parseEnv nao altera process.env e nao executa o conteudo do arquivo.
    const conexao = substituicao !== undefined ? substituicao :
      require('node:util').parseEnv(
        require('node:fs').readFileSync(path.resolve('apps/api/.env'), 'utf8')
      ).DATABASE_URL;
    if (typeof conexao !== 'string' || !conexao.trim()) throw new Error();
    etapa = 'CONEXAO_PROTOCOLO';
    // Recusa inclusive esquemas desconhecidos antes de entregar a URL ao Prisma.
    if (!/^postgres(?:ql)?:\/\//.test(conexao)) throw new Error();
    etapa = 'CONEXAO_URL_LOCAL';
    const url = new URL(conexao);
    if (!['postgresql:', 'postgres:'].includes(url.protocol) ||
        !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
        url.port !== '5433' || url.pathname !== '/modolume' || url.hash ||
        [...url.searchParams.keys()].some(k => k !== 'schema') ||
        url.searchParams.getAll('schema').length > 1 ||
        (url.searchParams.has('schema') && url.searchParams.get('schema') !== 'public')) {
      throw new Error();
    }
    url.searchParams.set('schema', 'public');
    etapa = 'PRISMA_CLIENTE';
    prisma = new PrismaClient({ datasources: { db: { url: url.toString() } }, log: [] });
    etapa = 'SQL_DESTINO';
    const destino = await prisma.$queryRawUnsafe(`SELECT current_database()::text AS banco,
      current_schema()::text AS esquema, inet_server_port()::int AS porta`);
    etapa = 'BANCO_SCHEMA_PORTA';
    if (destino.length !== 1 || destino[0].banco !== 'modolume' ||
        destino[0].esquema !== 'public' || destino[0].porta !== 5433) throw new Error();
    etapa = 'SQL_PLANO';
    const rows = await prisma.$queryRawUnsafe(`
      SELECT p.*, u.nome = $2 AS autor_confere, t.nome = $3 AS turma_confere,
        t.ativa AS turma_ativa, u.ativo AS autor_ativo, u.papel::text AS papel_autor,
        u.senha_provisoria, u.instituicao_id = t.instituicao_id AS mesma_instituicao,
        t.instituicao_id,
        (SELECT count(*)::int FROM public.professor_turma v
          WHERE v.professor_id=p.professor_id AND v.turma_id=p.turma_id) AS vinculos,
        (SELECT coalesce(json_agg(x.habilidade_codigo ORDER BY x.habilidade_codigo),'[]')
          FROM public.plano_habilidade x WHERE x.plano_id=p.id) AS habilidades,
        (SELECT coalesce(json_agg(x.formato_id ORDER BY x.formato_id),'[]')
          FROM public.plano_formato x WHERE x.plano_id=p.id) AS formatos,
        (SELECT coalesce(json_agg(x.missao_id ORDER BY x.missao_id),'[]')
          FROM public.plano_missao x WHERE x.plano_id=p.id) AS missoes,
        (SELECT coalesce(json_agg(x.aluno_id ORDER BY x.aluno_id),'[]')
          FROM public.plano_aluno_foco x WHERE x.plano_id=p.id) AS alunos_foco
      FROM public.plano_aula p
      JOIN public.professor u ON u.id=p.professor_id
      JOIN public.turma t ON t.id=p.turma_id WHERE p.id=$1`,
      'plano-mw52c20fmsa8', 'Professor Homologa\u00e7\u00e3o', 'Turma Homologa\u00e7\u00e3o');
    etapa = 'PLANO_EXISTENCIA';
    if (rows.length !== 1) throw new Error();
    const p=rows[0];
    etapa = 'PLANO_IDENTIDADE';
    if (p.autor_confere !== true || p.turma_confere !== true ||
        p.mesma_instituicao !== true) throw new Error();
    etapa = 'TURMA_ATIVA';
    if (p.turma_ativa !== true) throw new Error();
    etapa = 'PROFESSOR_ATIVO_PAPEL_SENHA';
    if (p.autor_ativo !== true || p.papel_autor !== 'professor' ||
        p.senha_provisoria !== false) throw new Error();
    etapa = 'VINCULO_AUSENTE';
    if (p.vinculos !== 0) throw new Error();
    etapa = 'TIPOS_PAYLOAD';
    if (!(p.data instanceof Date) || !Number.isInteger(p.aulas) ||
        ![p.habilidades,p.formatos,p.missoes,p.alunos_foco].every(Array.isArray)) throw new Error();
    const original={ turmaId:p.turma_id, data:p.data.toISOString().slice(0,10),
      horario:p.horario, aulas:p.aulas, tema:p.tema, unidade:p.unidade,
      habilidades:p.habilidades, objetivos:p.objetivos, conteudos:p.conteudos,
      metodologia:p.metodologia, formatos:p.formatos, atividadesApp:p.missoes,
      recursos:p.recursos, avaliacao:p.avaliacao, alunosFoco:p.alunos_foco,
      observacoes:p.observacoes, status:p.status, registro:p.registro };
    etapa = 'SCHEMA_COMPILACAO';
    const codigo=require('esbuild').buildSync({
      entryPoints:[path.resolve('packages/core/src/planejamento.ts')], bundle:true,
      write:false, platform:'node', format:'cjs', packages:'external', logLevel:'silent'
    }).outputFiles[0].text;
    const nome=path.resolve('packages/core/src/validacao-homologacao.cjs');
    const m=new Module(nome,module); m.filename=nome; m.paths=module.paths;
    m._compile(codigo,nome);
    const schema=m.exports.planoSchema;
    etapa = 'PAYLOAD_ORIGINAL';
    if (!schema.safeParse(original).success) throw new Error();
    const tema='Homologa\u00e7\u00e3o de autoriza\u00e7\u00e3o - edi\u00e7\u00e3o sem v\u00ednculo';
    etapa = 'TEMA_DISTINTO';
    if (original.tema === tema) throw new Error();
    etapa = 'PAYLOAD_TESTE';
    const validado=schema.safeParse({...original,tema});
    if (!validado.success) throw new Error();
    const alterados=Object.keys(original).filter(k =>
      JSON.stringify(original[k]) !== JSON.stringify(validado.data[k]));
    etapa = 'SOMENTE_TEMA';
    if (alterados.length !== 1 || alterados[0] !== 'tema') throw new Error();
    process.stdout.write(JSON.stringify({ ok:true, autorId:p.professor_id,
      instituicaoId:p.instituicao_id, payload:validado.data }).replace(
        /[\u007f-\uffff]/g, c => '\\u'+c.charCodeAt(0).toString(16).padStart(4,'0')));
  } catch (erro) {
    // Somente etapa e codigo conhecido; nunca mensagem/stack/consulta/valores.
    const codigo = typeof erro.code === 'string' && /^P\d{4}$/.test(erro.code)
      ? erro.code : null;
    process.stdout.write(JSON.stringify({ok:false,etapa,codigo}));
    process.exitCode=1;
  }
  finally { if (prisma) await prisma.$disconnect().catch(() => {}); }
})();
'@
        $etapa = 'NODE_EXECUCAO'
        $saida = $codigoNode | & node 2>$null
        $saidaCodigo = $LASTEXITCODE
        $etapa = 'NODE_RESPOSTA'
        $preparacao = ($saida -join "`n") | ConvertFrom-Json
        if ($preparacao.ok -isnot [bool] -or $preparacao.ok -ne $true -or $saidaCodigo -ne 0) {
            if ($preparacao.etapa -cmatch '^[A-Z_]{3,60}$') {
                $etapa = [string]$preparacao.etapa
            }
            if ($preparacao.codigo -cmatch '^P\d{4}$') {
                $diagnosticoNode = [string]$preparacao.codigo
            }
            throw 'Preparacao Node falhou.'
        }
        $etapa = 'SESSAO_AUTOR_INSTITUICAO'
        if ($preparacao.autorId -ne $eu.id -or
            $preparacao.instituicaoId -ne $eu.instituicao.id) { throw 'Identidade divergente.' }
        $etapa = 'HASH_FINAL'
        foreach ($arquivo in $arquivos) {
            if ((Get-FileHash -LiteralPath $arquivo -Algorithm SHA256).Hash -ne $hashes[$arquivo]) {
                throw 'Codigo alterado.'
            }
        }
        $etapa = 'PROCESSO_FINAL'
        $processoDepois = Get-ModolumeProcessoApi -Raiz $raiz -Arquivos $arquivos
        $etapa = 'PROCESSO_ESTABILIDADE'
        if (-not (Test-ModolumeProcessoIgual $processoAntes $processoDepois)) {
            throw 'Processo alterado durante preparacao.'
        }
        $script:ModolumePreparado = @{
            Raiz = $raiz; Conexao = $ConexaoLocal; Payload = $preparacao.payload
            Processo = $processoDepois; Hashes = $hashes; Arquivos = $arquivos
        }
        'PREPARACAO_APROVADA'
    }
    catch {
        $script:ModolumePreparado = $null
        $etapaProcesso = $_.Exception.Data['EtapaHomologacao']
        if ($etapaProcesso -cmatch '^PROCESSO_[A-Z_]+$') { $etapa = $etapaProcesso }
        if ($etapa -eq 'AUTENTICACAO_GET' -and $_.Exception.Response) {
            $statusAutenticacao = [int]$_.Exception.Response.StatusCode
            if ($statusAutenticacao -ge 100 -and $statusAutenticacao -le 599) {
                $diagnosticoNode = "HTTP_$statusAutenticacao"
            }
        }
        if ($diagnosticoNode) { "FALHA_PREPARACAO: $etapa ($diagnosticoNode)" }
        else { "FALHA_PREPARACAO: $etapa" }
    }
    finally {
        [Environment]::SetEnvironmentVariable('MODOLUME_HOMOLOGACAO_DB', $ambienteAnterior, 'Process')
        $conexao = $null; $saida = $null; $preparacao = $null
    }
}

function Enviar-ModolumePutHomologacao {
    param(
        [Parameter(Mandatory)]
        [ValidateSet('CONFIRMO_UMA_TENTATIVA_PUT_LOCAL')]
        [string] $Confirmacao
    )
    $ErrorActionPreference = 'Stop'
    if ($script:ModolumePutTentado) { 'FALHA_ENVIO: tentativa ja iniciada nesta sessao.'; return }
    if (-not $script:ModolumePreparado -or
        (Get-Location).Path -ne $script:ModolumePreparado.Raiz) {
        'FALHA_ENVIO: preparacao ausente ou pasta alterada.'; return
    }
    $cliente = $null; $handler = $null; $requisicao = $null; $resposta = $null
    try {
        # Detecta troca do processo desde a preparacao aprovada pelo operador.
        $anterior = $script:ModolumePreparado
        $atual = Get-ModolumeProcessoApi -Raiz $anterior.Raiz -Arquivos $anterior.Arquivos
        if (-not (Test-ModolumeProcessoIgual $anterior.Processo $atual)) {
            throw 'Processo alterado; nova preparacao necessaria.'
        }
        foreach ($arquivo in $anterior.Arquivos) {
            if ((Get-FileHash -LiteralPath $arquivo -Algorithm SHA256).Hash -ne $anterior.Hashes[$arquivo]) {
                throw 'Codigo alterado; nova preparacao necessaria.'
            }
        }
        # Refaz GET, SELECT e validacao; nao reutiliza um payload desatualizado.
        $resultado = Testar-ModolumePreparacao -ConexaoLocal $anterior.Conexao
        if ($resultado -ne 'PREPARACAO_APROVADA') { throw 'Revalidacao falhou.' }
        $pronto = $script:ModolumePreparado
        $atual = Get-ModolumeProcessoApi -Raiz $pronto.Raiz -Arquivos $pronto.Arquivos
        if (-not (Test-ModolumeProcessoIgual $anterior.Processo $atual)) { throw 'Processo alterado.' }
        foreach ($arquivo in $pronto.Arquivos) {
            if ((Get-FileHash -LiteralPath $arquivo -Algorithm SHA256).Hash -ne $pronto.Hashes[$arquivo]) {
                throw 'Codigo alterado.'
            }
        }
        Add-Type -AssemblyName System.Net.Http
        $handler = [System.Net.Http.HttpClientHandler]::new()
        $handler.AllowAutoRedirect = $false; $handler.UseProxy = $false
        $cliente = [System.Net.Http.HttpClient]::new($handler)
        $cliente.Timeout = [TimeSpan]::FromSeconds(30)
        $requisicao = [System.Net.Http.HttpRequestMessage]::new(
            [System.Net.Http.HttpMethod]::Put,
            'http://127.0.0.1:3333/professor/planos/plano-mw52c20fmsa8')
        if (-not $requisicao.Headers.TryAddWithoutValidation(
                'Authorization', [string]$cabecalhosTeste['Authorization'])) { throw 'Cabecalho invalido.' }
        $json = $pronto.Payload | ConvertTo-Json -Depth 20
        $requisicao.Content = [System.Net.Http.StringContent]::new(
            $json, [Text.Encoding]::UTF8, 'application/json')
        $script:ModolumePutTentado = $true
        $resposta = $cliente.SendAsync($requisicao,
            [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead).GetAwaiter().GetResult()
        'HTTP {0}' -f [int]$resposta.StatusCode
    }
    catch { 'FALHA_ENVIO: nao repetir automaticamente; conferir o banco antes de nova tentativa.' }
    finally {
        if ($resposta) { $resposta.Dispose() }
        if ($requisicao) { $requisicao.Dispose() }
        if ($cliente) { $cliente.Dispose() }
        if ($handler) { $handler.Dispose() }
        $script:ModolumePreparado = $null
        $json = $null; $pronto = $null; $anterior = $null
    }
}
