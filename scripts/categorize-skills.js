#!/usr/bin/env node
/**
 * Categorizes all skills in skills_index.json based on skill ID and description keywords.
 */

const fs = require('fs');
const path = require('path');

const SKILLS_INDEX_PATH = path.join(__dirname, '../assets/skills_index.json');

// Category rules: each entry has a category name and an array of keyword matchers (regex or string)
// Rules are evaluated in order; first match wins.
const CATEGORY_RULES = [
  // ── GAME DEVELOPMENT ─────────────────────────────────────────────────────────
  {
    category: 'game-development',
    keywords: [
      /\bgame[s\-_]?\b/i, /\bgame.dev/i, /\bunity\b/i, /\bunreal\b/i,
      /\bgodot\b/i, /\bpygame\b/i, /\bphaser\b/i, /\blove2d\b/i,
      /\b2d.game\b/i, /\b3d.game\b/i, /\bsprite\b/i, /\btilemap\b/i,
      /\bgame.engine\b/i, /\bgame.loop\b/i, /\bgame.physics\b/i,
      /\bnpc\b/i, /\bquest.system\b/i, /\bgame.design\b/i,
      /\bgame.balance\b/i, /\bgame.ai\b/i, /\bgame.mechanic\b/i,
      /\bgame.asset\b/i, /\bshader\b/i, /\blevel.design\b/i,
      /\bprocedural.generation\b/i, /\bgame.multiplayer\b/i, /\bnetcode\b/i,
    ],
  },

  // ── LIBREOFFICE / OFFICE ──────────────────────────────────────────────────────
  {
    category: 'office-productivity',
    keywords: [
      /\blibreoffice\b/i, /\bms.office\b/i, /\bmicrosoft.office\b/i,
      /\bword\b/i, /\bexcel\b/i, /\bpowerpoint\b/i, /\bspreadsheet\b/i,
      /\bworkbook\b/i, /\bpresentation.slide\b/i, /\boffice.suite\b/i,
      /^libreoffice/i, /^ms-office/i, /^office-/i,
    ],
  },

  // ── AI / ML / LLM / AGENTS ───────────────────────────────────────────────────
  {
    category: 'ai-ml',
    keywords: [
      /\bllm\b/i, /\blarge.language.model\b/i, /\brag\b/i,
      /\bembedding\b/i, /\bvector.store\b/i, /\bvector.search\b/i,
      /\bai.agent\b/i, /\bautonomous.agent\b/i, /\bagent.architect/i,
      /\bagent.orchestrat/i, /\bagent.memory\b/i, /\bagent.evaluation\b/i,
      /\bagent.tool\b/i, /\bmulti.agent\b/i, /\bai.engineer\b/i,
      /\bai.product\b/i, /\bai.wrapper\b/i, /\bai.ml\b/i,
      /\bmachine.learning\b/i, /\bdeep.learning\b/i, /\bneural.network\b/i,
      /\btransformer\b/i, /\bfine.tun/i, /\bprompt.engineer/i,
      /\banthropic\b/i, /\bclaude\b/i, /\bgpt\b/i, /\bopenai\b/i,
      /\bgemini\b/i, /\bllama\b/i, /\bcrewai\b/i, /\blanggraph\b/i,
      /\blangchain\b/i, /\bagentic\b/i, /\bgenerative.ai\b/i,
      /\bai.orchestrat\b/i, /\bai.model\b/i, /\bai.tool\b/i,
      /\bai.workflow\b/i, /\bai.framework\b/i, /\bai.system\b/i,
      /^agent-/i, /^ai-/i, /^llm-/i, /\bhuggingface\b/i,
      /\bsemantickernel\b/i, /\bmodel.context.protocol\b/i,
      /\bmcp.server\b/i, /\bmcp.tool\b/i, /\bmcp.client\b/i,
      /\bautogen\b/i, /\bvitesse\b/i,
    ],
  },

  // ── SECURITY ─────────────────────────────────────────────────────────────────
  {
    category: 'security',
    keywords: [
      /\bsecurity\b/i, /\bpenetration.test/i, /\bpentest\b/i,
      /\bvulnerabilit/i, /\bexploit\b/i, /\bmalware\b/i, /\breverse.engineer/i,
      /\bsecurity.audit\b/i, /\bsoc\b/i, /\bincident.response\b/i,
      /\bcve\b/i, /\bsecurity.hardening\b/i, /\bthreat.model/i,
      /\battack.tree\b/i, /\bred.team\b/i, /\bbug.bounty\b/i,
      /\bctf\b/i, /\bsecurity.research\b/i, /\bzap\b/i, /\bnmap\b/i,
      /\bmetasploit\b/i, /\bblastone\b/i, /\bbsides\b/i,
      /\bactive.directory.attack\b/i, /\bkerberoast\b/i, /\bdcsync\b/i,
      /\bpass.the.hash\b/i, /\bgolden.ticket\b/i, /\bbloodhound\b/i,
      /\baws.penetration\b/i, /\bapi.fuzzing\b/i, /\banti.reversing\b/i,
      /\bpayload\b/i, /\bzerologon\b/i, /\bsplunk.siem\b/i,
      /\bsast\b/i, /\bdast\b/i, /\bifconfig\b/i, /\bwaf\b/i,
      /\bids.ips\b/i, /\bfirewall\b/i, /\bcryptograph/i,
    ],
  },

  // ── CLOUD / DEVOPS / INFRASTRUCTURE ──────────────────────────────────────────
  {
    category: 'cloud-devops',
    keywords: [
      /\baws\b/i, /\bazure\b/i, /\bgcp\b/i, /\bgoogle.cloud\b/i,
      /\bkubernetes\b/i, /\bk8s\b/i, /\bdocker\b/i, /\bcontainer\b/i,
      /\bterraform\b/i, /\bbicep\b/i, /\bansible\b/i, /\bpulumi\b/i,
      /\bci.cd\b/i, /\bgithub.actions\b/i, /\bjenkinsfile\b/i,
      /\binfrastructure.as.code\b/i, /\iac\b/i, /\bcloud.native\b/i,
      /\bserverless\b/i, /\blambda.function\b/i, /\bcloud.function\b/i,
      /\becs\b/i, /\beks\b/i, /\bcloud.run\b/i, /\bazure.container/i,
      /\bdevops\b/i, /\bsite.reliability\b/i, /\bsre\b/i,
      /\bmonitoring\b/i, /\bobservabilit/i, /\bprometheus\b/i,
      /\bgrafana\b/i, /\bdatadog\b/i, /\bnewrelic\b/i, /\bpagerduty\b/i,
      /\bdeploy\b/i, /\brendering.deploy\b/i, /\bapp.deploy\b/i,
      /\bvercel\b/i, /\bnetlify\b/i, /\brailway\b/i, /\bflyio\b/i,
      /\bheroku\b/i, /\bdigitalocean\b/i, /\bvps\b/i, /\bnginx\b/i,
      /\bapache.server\b/i, /\bapp.runner\b/i, /\bazd\b/i,
      /\baws.cost\b/i, /\baws.cleanup\b/i,
    ],
  },

  // ── FRONTEND / WEB UI ─────────────────────────────────────────────────────────
  {
    category: 'frontend',
    keywords: [
      /\breact\b/i, /\bvue\b/i, /\bsvelte\b/i, /\bnext\.?js\b/i,
      /\bnuxt\b/i, /\bremix\b/i, /\bastro\b/i, /\bsolid\.?js\b/i,
      /\bqwik\b/i, /\bhtmx\b/i, /\bhtml\b/i, /\bcss\b/i, /\bsass\b/i,
      /\btailwind\b/i, /\bboostrap\b/i, /\bmaterialui\b/i,
      /\bchakra.ui\b/i, /\bshadcn\b/i, /\bradix.ui\b/i,
      /\bstorybook\b/i, /\bweb.component\b/i, /\bcustom.element\b/i,
      /\bwebpack\b/i, /\bvite\b/i, /\brollup\b/i, /\bparcel\b/i,
      /\btypescript.react\b/i, /\bjavascript.ui\b/i, /\bui.component\b/i,
      /\bfrontend\b/i, /\bfront.end\b/i, /\bweb.ui\b/i,
      /\bresponsive.design\b/i, /\bux.design\b/i, /\bui.ux\b/i,
      /\bweb.design\b/i, /\bcanvas.api\b/i, /\bwebgl\b/i,
      /\bthree\.js\b/i, /\b3d.web\b/i, /\banimation.css\b/i,
      /\bframer.motion\b/i, /\bgsap\b/i, /\blottie\b/i,
      /\baccessibilit/i, /\bwcag\b/i, /\ba11y\b/i, /\baria\b/i,
      /\bpwa\b/i, /\bservice.worker\b/i, /\bweb.vitals\b/i,
    ],
  },

  // ── ANGULAR ───────────────────────────────────────────────────────────────────
  {
    category: 'frontend',
    keywords: [/^angular/i, /\bangular\b/i, /\bngrx\b/i, /\brxjs\b/i],
  },

  // ── BACKEND / SERVER-SIDE ─────────────────────────────────────────────────────
  {
    category: 'backend',
    keywords: [
      /\bnode\.?js\b/i, /\bexpress\.?js\b/i, /\bfastify\b/i,
      /\bnest\.?js\b/i, /\bkoa\b/i, /\bhapi\b/i, /\bfastapi\b/i,
      /\bflask\b/i, /\bdjango\b/i, /\bspring.boot\b/i, /\bspring.mvc\b/i,
      /\blaravel\b/i, /\bruby.on.rails\b/i, /\brails\b/i,
      /\bphp\b/i, /\brust.web\b/i, /\bactix\b/i, /\baxum\b/i,
      /\bgolang.server\b/i, /\bgo.server\b/i, /\bgin.framework\b/i,
      /\becho.framework\b/i, /\bserver.side\b/i, /\bbackend\b/i,
      /\bback.end\b/i, /\brest.api\b/i, /\bgraphql.server\b/i,
      /\bgrpc\b/i, /\bprotobuf\b/i, /\bthrift\b/i, /\bwebsocket\b/i,
      /\bserver.sent.event\b/i, /\bsse\b/i, /\bmicroservice\b/i,
      /\bmonolith\b/i, /\barchitecture.pattern\b/i,
    ],
  },

  // ── DATABASE ──────────────────────────────────────────────────────────────────
  {
    category: 'database',
    keywords: [
      /\bdatabase\b/i, /\bpostgres\b/i, /\bmysql\b/i, /\bsqlite\b/i,
      /\bmongodb\b/i, /\bredis\b/i, /\belasticsearch\b/i,
      /\bdynamodb\b/i, /\bcassandra\b/i, /\bcosmosdb\b/i,
      /\bfirestore\b/i, /\bsupabase\b/i, /\bneon\b/i, /\bplanetscale\b/i,
      /\bprisma\b/i, /\bdrizzle\b/i, /\btypeorm\b/i, /\bsequelize\b/i,
      /\borm\b/i, /\bsql\b/i, /\bnosql\b/i, /\bquery.optim/i,
      /\bvector.db\b/i, /\bpgvector\b/i, /\bpinecone\b/i,
      /\bchroma\b/i, /\bweaviat\b/i, /\bmilvus\b/i, /\bqdrant\b/i,
      /\bclickhouse\b/i, /\bbigquery\b/i, /\bsnowflake\b/i,
    ],
  },

  // ── DATA ENGINEERING / ANALYTICS ─────────────────────────────────────────────
  {
    category: 'data-engineering',
    keywords: [
      /\bairflow\b/i, /\bpipeline\b/i, /\bdata.engineer/i,
      /\betl\b/i, /\belt\b/i, /\bspark\b/i, /\bkafka\b/i,
      /\bflink\b/i, /\bpanadas\b/i, /\bpandas\b/i, /\bnumpy\b/i,
      /\bdbt\b/i, /\bprefect\b/i, /\bdagster\b/i, /\blake.house\b/i,
      /\bdelta.lake\b/i, /\bpceh\b/i, /\bdata.warehouse\b/i,
      /\banalytics\b/i, /\bdata.analyt/i, /\bmetrics\b/i,
      /\bga4\b/i, /\bgtm\b/i, /\bsegment\b/i, /\bamplitude\b/i,
      /\bmixpanel\b/i, /\btracking\b/i, /\ba\/b.test/i,
      /\bab.test\b/i, /\bexperiment\b/i, /\bdata.viz\b/i,
      /\btableau\b/i, /\bpower.bi\b/i, /\blooker\b/i,
      /\bdata.science\b/i, /\bjupyter\b/i, /\bnotebook\b/i,
    ],
  },

  // ── MOBILE ────────────────────────────────────────────────────────────────────
  {
    category: 'mobile',
    keywords: [
      /\bjust.in.time.compilation\b/i,
      /\breact.native\b/i, /\bflutter\b/i, /\bswift\b/i,
      /\bswiftui\b/i, /\bkotlin\b/i, /\bjetpack.compose\b/i,
      /\bandroid\b/i, /\bios.dev\b/i, /\bapp.store\b/i,
      /\bplay.store\b/i, /\bapp.store.optim/i, /\baso\b/i,
      /\bexpo\b/i, /\bcapacitor\b/i, /\bionic\b/i,
      /\bpush.notification\b/i, /\bmobile.app\b/i,
    ],
  },

  // ── API DESIGN / DOCUMENTATION ────────────────────────────────────────────────
  {
    category: 'api',
    keywords: [
      /\bapi.design\b/i, /\bopenapi\b/i, /\bswagger\b/i,
      /\bapi.document/i, /\bapi.pattern\b/i, /\bapi.test/i,
      /\bapi.securit/i, /\bapi.gateway\b/i, /\bapi.version/i,
      /\bapi.rate.limit\b/i, /\bapi.mock\b/i, /\brest.api\b/i,
      /^api-/i,
    ],
  },

  // ── TESTING / QA ─────────────────────────────────────────────────────────────
  {
    category: 'testing',
    keywords: [
      /\bunit.test\b/i, /\bintegration.test\b/i, /\bend.to.end\b/i,
      /\be2e.test\b/i, /\btest.driven\b/i, /\btdd\b/i, /\bbdd\b/i,
      /\bplaywright\b/i, /\bcypress\b/i, /\bselenium\b/i,
      /\bpuppeteer\b/i, /\bvitest\b/i, /\bjest\b/i, /\bmocha\b/i,
      /\bchai\b/i, /\bpytest\b/i, /\bunittest\b/i, /\bkotest\b/i,
      /\bspec\b/i, /\btest.coverage\b/i, /\bmutation.test/i,
      /\btest.automation\b/i, /\bqa.engineer\b/i, /\bquality.assurance\b/i,
      /\bbrowser.qa\b/i, /\bapi.test\b/i, /^test-/i,
    ],
  },

  // ── PYTHON ────────────────────────────────────────────────────────────────────
  {
    category: 'python',
    keywords: [
      /^python-/i, /\bpython\b/i, /\basync.python\b/i,
      /\bfastapi\b/i, /\buvicorn\b/i, /\bpydantic\b/i,
      /\bcelery\b/i, /\bclick\b/i, /\btyper\b/i,
    ],
  },

  // ── JAVASCRIPT / TYPESCRIPT ───────────────────────────────────────────────────
  {
    category: 'javascript-typescript',
    keywords: [
      /^js-/i, /^ts-/i, /\bjavascript\b/i, /\btypescript\b/i,
      /\besmodule\b/i, /\bcommonjs\b/i, /\bbun\b/i, /\bdeno\b/i,
      /\bwebassembly\b/i, /\bwasm\b/i,
    ],
  },

  // ── RUST ──────────────────────────────────────────────────────────────────────
  {
    category: 'rust',
    keywords: [/\brust\b/i, /^rust-/i, /\bcargo\b/i, /\btokio\b/i],
  },

  // ── GO ────────────────────────────────────────────────────────────────────────
  {
    category: 'golang',
    keywords: [/\bgolang\b/i, /^go-/i, /\bgo.lang\b/i],
  },

  // ── JAVA / KOTLIN / JVM ───────────────────────────────────────────────────────
  {
    category: 'jvm',
    keywords: [
      /\bjava\b/i, /\bkotlin\b/i, /\bscala\b/i, /\bgroovy\b/i,
      /\bmaven\b/i, /\bgradle\b/i, /\bspring\b/i, /\bjvm\b/i,
      /\bquarkus\b/i, /\bmicronaut\b/i, /\bvert.x\b/i,
    ],
  },

  // ── C / C++ / EMBEDDED ───────────────────────────────────────────────────────
  {
    category: 'embedded-systems',
    keywords: [
      /\bembedded\b/i, /\bfirmware\b/i, /\bmicrocontroller\b/i,
      /\barm.cortex\b/i, /\barduino\b/i, /\besp32\b/i, /\bstm32\b/i,
      /\brtos\b/i, /\bbare.metal\b/i, /\bdma\b/i, /\binterrupt\b/i,
      /\buart\b/i, /\bspi\b/i, /\bi2c\b/i, /\bcan.bus\b/i,
      /\bc\+\+\b/i, /\bcpp\b/i, /\basse?mbl/i, /\blinker\b/i,
    ],
  },

  // ── .NET / C# ─────────────────────────────────────────────────────────────────
  {
    category: 'dotnet',
    keywords: [
      /\b\.net\b/i, /\bcsharp\b/i, /\bc#\b/i, /\basp\.net\b/i,
      /\bblazor\b/i, /\bmaui\b/i, /\bxamarin\b/i, /\bef.core\b/i,
      /\bavalonia\b/i, /\bwpf\b/i, /\bwinforms\b/i,
      /^dotnet-/i, /^csharp-/i, /\bunity.csharp\b/i,
    ],
  },

  // ── DESKTOP / CROSS-PLATFORM ─────────────────────────────────────────────────
  {
    category: 'desktop',
    keywords: [
      /\belectron\b/i, /\btauri\b/i, /\bqt\b/i, /\bwxwidget\b/i,
      /\bgtk\b/i, /\bimgui\b/i, /\bavalonia\b/i, /\bwinui\b/i,
      /\bdesktop.app\b/i, /\bnative.app\b/i,
    ],
  },

  // ── DEVTOOLS / DX ────────────────────────────────────────────────────────────
  {
    category: 'developer-tools',
    keywords: [
      /\bvscode\b/i, /\bvs.code\b/i, /\bextension.dev/i,
      /\bide.plugin\b/i, /\bgit\b/i, /\bgh.cli\b/i, /\bgithub\b/i,
      /\bgitlab\b/i, /\bbitbucket\b/i, /\bversion.control\b/i,
      /\blinter\b/i, /\bformatter\b/i, /\bprettier\b/i,
      /\beslint\b/i, /\biomejs\b/i, /\bnpm\b/i, /\byarn\b/i,
      /\bpnpm\b/i, /\bbun.pm\b/i, /\bcli.tool\b/i, /\btmux\b/i,
      /\bshell.script\b/i, /\bbash\b/i, /\bzsh\b/i,
      /\bdebug\b/i, /\bprofil/i, /\btracing\b/i,
    ],
  },

  // ── ARCHITECTURE / SYSTEM DESIGN ─────────────────────────────────────────────
  {
    category: 'architecture',
    keywords: [
      /\barchitect\b/i, /\bsystem.design\b/i, /\bclean.architect/i,
      /\bhexagonal\b/i, /\bddd\b/i, /\bdomain.driven\b/i,
      /\bcqrs\b/i, /\bevent.sourcing\b/i, /\bevent.driven\b/i,
      /\bmessage.queue\b/i, /\bpub.sub\b/i, /\bsaw.dust\b/i,
      /\bsaga.pattern\b/i, /\bcircuit.breaker\b/i,
      /\bdesign.pattern\b/i, /\bsolid.principl/i, /\bsoftware.design\b/i,
      /\badr\b/i, /\barchitecture.decision\b/i,
    ],
  },

  // ── PRODUCT / PROJECT MANAGEMENT ─────────────────────────────────────────────
  {
    category: 'product-management',
    keywords: [
      /\bproduct.manage/i, /\bproject.manage/i, /\broadmap\b/i,
      /\bscrum\b/i, /\bkanban\b/i, /\bagile\b/i, /\bsprint\b/i,
      /\bjira\b/i, /\basana\b/i, /\blinear\b/i, /\bbasecamp\b/i,
      /\bproduct.requirement\b/i, /\bprd\b/i, /\buser.stor/i,
      /\bproduct.design\b/i, /\bprioriti/i,
    ],
  },

  // ── MARKETING / SEO / GROWTH ─────────────────────────────────────────────────
  {
    category: 'marketing-growth',
    keywords: [
      /\bseo\b/i, /\bsem\b/i, /\bcontent.market/i, /\bgrowth.hacking\b/i,
      /\bconversion.rate\b/i, /\bcro\b/i, /\bfunnel\b/i,
      /\bemailing\b/i, /\bnewsletter\b/i, /\bmailchimp\b/i,
      /\bactivecampaign\b/i, /\bhubspot\b/i, /\bmarketo\b/i,
      /\bsalesforce\b/i, /\bcrm\b/i, /\blandingpage\b/i,
      /\bapp.store.optim/i, /\baso\b/i,
    ],
  },

  // ── AUTOMATION / INTEGRATION / NO-CODE ───────────────────────────────────────
  {
    category: 'automation',
    keywords: [
      /\bautomation\b/i, /\bzapier\b/i, /\bmake\.com\b/i,
      /\bn8n\b/i, /\bairtable\b/i, /\bnotion\b/i, /\bslack\b/i,
      /\bdiscord\b/i, /\bwhatsapp\b/i, /\btelegram\b/i,
      /\bwebhook\b/i, /\bintegration\b/i, /\bcomposio\b/i,
      /\brube.mcp\b/i, /\bworkflow.automat/i, /\bipa\b/i,
      /\bhome.automat/i, /\bsmarthome\b/i, /\biot\b/i,
    ],
  },

  // ── AUTH / IDENTITY ───────────────────────────────────────────────────────────
  {
    category: 'auth',
    keywords: [
      /\bauth\b/i, /\bjwt\b/i, /\boauth\b/i, /\boidc\b/i,
      /\bsaml\b/i, /\brbac\b/i, /\babac\b/i, /\biam\b/i,
      /\bidentity\b/i, /\bsession.manage/i, /\bpassword\b/i,
      /\bmfa\b/i, /\bsso\b/i, /\bpasskey\b/i, /\bwebauthn\b/i,
      /\bclerk\b/i, /\bauth0\b/i, /\bfirebase.auth\b/i,
      /\bnext.auth\b/i, /\bsupabase.auth\b/i,
    ],
  },

  // ── CONTENT / WRITING / DOCS ──────────────────────────────────────────────────
  {
    category: 'content-documentation',
    keywords: [
      /\bdocument/i, /\btechnical.writ/i, /\bblog.writ/i,
      /\bcopywriting\b/i, /\bcontent.creat/i, /\bmarkdown\b/i,
      /\blogbook\b/i, /\bchangelog\b/i, /\breadme\b/i,
      /\bapi.doc\b/i, /\bdocusaurus\b/i, /\bmkdocs\b/i,
      /\bgitbook\b/i, /\btranslat/i, /\blocali[sz]/i,
      /\bi18n\b/i, /\bl10n\b/i,
    ],
  },

  // ── PERFORMANCE / OPTIMIZATION ───────────────────────────────────────────────
  {
    category: 'performance',
    keywords: [
      /\bperformance.optim/i, /\bprofil/i, /\bbenchmark\b/i,
      /\bcaching\b/i, /\bcdn\b/i, /\bload.balanc/i,
      /\bcore.web.vitals\b/i, /\blighthouse\b/i, /\boptimiz/i,
      /\bmemory.leak\b/i, /\blatency\b/i, /\bthroughput\b/i,
    ],
  },

  // ── APP BUILDER ───────────────────────────────────────────────────────────────
  {
    category: 'app-builder',
    keywords: [/^app-builder/i, /\bapp.builder\b/i],
  },

  // ── FUNCTIONAL / OTHER LANGUAGES ──────────────────────────────────────────────
  {
    category: 'programming-languages',
    keywords: [
      /\bhaskell\b/i, /\belixir\b/i, /\bclojure\b/i, /\bscala\b/i,
      /\berl?ang\b/i, /\bocaml\b/i, /\bf#\b/i, /\bfsharp\b/i,
      /\blua\b/i, /\bperl\b/i, /\bnimlang\b/i, /\bzig\b/i,
      /\bcrystal.lang\b/i, /\bprogramming.language\b/i,
    ],
  },

  // ── CODE QUALITY / REFACTORING ────────────────────────────────────────────────
  {
    category: 'code-quality',
    keywords: [
      /\brefactor\b/i, /\bclean.code\b/i, /\bcode.review\b/i,
      /\bcode.qualit/i, /\blint\b/i, /\bstatic.analysis\b/i,
      /\btech.debt\b/i, /\bcode.smell\b/i, /\bsolid.principl/i,
      /\bcode.standard\b/i, /\bcode.style\b/i, /\bcode.coverage\b/i,
      /\bverification\b/i, /\bcode.cleanup\b/i,
    ],
  },

  // ── WORKFLOW / PLANNING ───────────────────────────────────────────────────────
  {
    category: 'workflow-planning',
    keywords: [
      /\bplanning\b/i, /\btask.plan\b/i, /\bimplementation.plan\b/i,
      /\bbrainstorm\b/i, /\bworkflow\b/i, /\bconductor\b/i,
      /\bcontext.manage\b/i, /\bcontext.compress\b/i,
      /\bcontext.driven\b/i, /\bcontext.fundamental\b/i,
      /\bcontext.save\b/i, /\bcontext.restore\b/i,
      /\bcontext.degradat\b/i, /\bparallel.agent\b/i,
      /\bdispatching\b/i, /\bsubagent\b/i, /\bexecuting.plan\b/i,
      /\bplan.writing\b/i, /\bconcise.plan\b/i,
    ],
  },

  // ── NETWORK ───────────────────────────────────────────────────────────────────
  {
    category: 'networking',
    keywords: [
      /\bnetwork\b/i, /\btcp\b/i, /\bip.address\b/i, /\bdns\b/i,
      /\bvpn\b/i, /\bssl\b/i, /\btls\b/i, /\bmtls\b/i,
      /\bhttp\b/i, /\bhttps\b/i, /\bsocket\b/i, /\bpeer.to.peer\b/i,
      /\bwebrtc\b/i, /\bwireshark\b/i, /\bpacket.analys\b/i,
      /\bhybrid.cloud.network\b/i, /\bnetwork.101\b/i,
      /\bshodan\b/i,
    ],
  },

  // ── SEARCH / WEB RESEARCH ─────────────────────────────────────────────────────
  {
    category: 'research',
    keywords: [
      /\bweb.search\b/i, /\bweb.research\b/i, /\bsearch.specialist\b/i,
      /\bresearch.engineer\b/i, /\bexa.search\b/i, /\btavily\b/i,
      /\bfirecrawl\b/i, /\bscraping\b/i, /\breverse.lookup\b/i,
      /\bcompetitive.landscape\b/i, /\bmarket.sizing\b/i,
      /\bmarket.opportunit\b/i, /\bmarket.research\b/i,
      /\bwiki.qa\b/i, /\bwiki.researcher\b/i, /\blast30days\b/i,
    ],
  },

  // ── STARTUP / BUSINESS ANALYSIS ───────────────────────────────────────────────
  {
    category: 'startup-business',
    keywords: [
      /\bstartup\b/i, /\bfinancial.model/i, /\bfinancial.project/i,
      /\bbusiness.analys/i, /\bmarket.opportunit/i, /\btam\b/i,
      /\bmicro.saas\b/i, /\bsaas.launch\b/i, /\bpersonal.tool.build/i,
      /\bproduct.launch\b/i, /\blaunch.strategy\b/i,
      /\bviral.generator\b/i, /\bpricing.strategy\b/i,
    ],
  },

  // ── WRITING / CREATIVE ────────────────────────────────────────────────────────
  {
    category: 'writing',
    keywords: [
      /\bprose\b/i, /\bcopyedit\b/i, /\bcopy.edit\b/i,
      /\bwriting.skill\b/i, /\btechnical.writing\b/i, /\bblog\b/i,
      /\barticle.publish\b/i, /\bblog.writ\b/i, /\bsales.email\b/i,
      /\bpaid.ad\b/i, /\bsales.automat\b/i, /\bemail.system\b/i,
    ],
  },

  // ── HR / TEAM ─────────────────────────────────────────────────────────────────
  {
    category: 'hr-team',
    keywords: [
      /\bhr\b/i, /\bhuman.resource\b/i, /\bonboarding\b/i,
      /\boffboarding\b/i, /\bteam.composition\b/i, /\bteam.collaborat/i,
      /\bstandup\b/i, /\bhiring\b/i, /\binterview\b/i,
      /\bperformance.review\b/i, /\bcompensation\b/i,
    ],
  },

  // ── SUPPLY CHAIN / OPERATIONS ─────────────────────────────────────────────────
  {
    category: 'operations',
    keywords: [
      /\bsupply.chain\b/i, /\binventor/i, /\bdemand.plan/i,
      /\bproduction.schedul/i, /\bquality.nonconform/i,
      /\breturns.reverse\b/i, /\breverse.logistic\b/i,
      /\bwarehouse\b/i, /\blogistic\b/i, /\bprocurement\b/i,
    ],
  },

  // ── APPLE HIG / iOS DESIGN ────────────────────────────────────────────────────
  {
    category: 'mobile',
    keywords: [
      /\bhig.component\b/i, /\bhig.platform\b/i, /\bapple.hig\b/i,
      /^hig-/i,
    ],
  },

  // ── CREATIVE / ART ───────────────────────────────────────────────────────────
  {
    category: 'creative',
    keywords: [
      /\balgorithmic.art\b/i, /\bgenerative.art\b/i, /\bscroll.experience\b/i,
      /\binteractive.portfolio\b/i, /\bportfolio.design\b/i,
      /\bp5\.js\b/i, /\bcreative.cod/i, /\bdigital.art\b/i,
    ],
  },

  // ── SKILL / AGENT META-TOOLS ──────────────────────────────────────────────────
  {
    category: 'meta-skills',
    keywords: [
      /\bskill.creator\b/i, /\bskill.writing\b/i, /\busing.superpowers\b/i,
      /\bagentfolio\b/i, /\bskill.builder\b/i, /\bprompt.library\b/i,
      /\bproject.guideline\b/i, /\btool.design\b/i,
    ],
  },

  // ── DESIGN / UI-UX (non-web) ──────────────────────────────────────────────────
  {
    category: 'design',
    keywords: [
      /\bfigma\b/i, /\bsketch\b/i, /\badobe.xd\b/i, /\binvision\b/i,
      /\bdesign.system\b/i, /\bdesign.token\b/i, /\btypograph/i,
      /\bcolor.system\b/i, /\bui.design\b/i, /\bux.research\b/i,
      /\bwireframe\b/i, /\bprototype\b/i, /\bdesign.handbook\b/i,
    ],
  },

  // ── BLOCKCHAIN / WEB3 ─────────────────────────────────────────────────────────
  {
    category: 'blockchain-web3',
    keywords: [
      /\bblockchain\b/i, /\bweb3\b/i, /\bsolidity\b/i,
      /\bsmart.contract\b/i, /\bnft\b/i, /\bdefi\b/i,
      /\bethereum\b/i, /\bsolana\b/i, /\bpolygon\b/i, /\bhardhat\b/i,
      /\bfoundry\b/i, /\bwagmi\b/i, /\bethers\.js\b/i, /\bweb3\.js\b/i,
    ],
  },

  // ── FINTECH / PAYMENTS ────────────────────────────────────────────────────────
  {
    category: 'fintech',
    keywords: [
      /\bstripe\b/i, /\bpayment\b/i, /\bpaypal\b/i, /\bwallet\b/i,
      /\bfintech\b/i, /\baccounting\b/i, /\bbilling\b/i,
      /\bsubscription\b/i, /\binvoice\b/i, /\btax\b/i,
    ],
  },

  // ── ECOMMERCE ────────────────────────────────────────────────────────────────
  {
    category: 'ecommerce',
    keywords: [
      /\becommerce\b/i, /\bshopify\b/i, /\bwoocommerce\b/i,
      /\bcart\b/i, /\bcheckout\b/i, /\bproduct.catalog\b/i,
      /\bshipping\b/i, /\binventor\b/i, /\border.manage/i,
      /\bmagento\b/i,
    ],
  },

  // ── CONSULTING / BUSINESS ─────────────────────────────────────────────────────
  {
    category: 'consulting',
    keywords: [
      /\bconsult\b/i, /\bbusiness.strateg/i, /\benterprise.architect/i,
      /\bdigital.transform/i, /\bstakeholder\b/i, /\bchange.manage/i,
      /\bprocess.improve/i, /\blean\b/i, /\bsix.sigma\b/i,
    ],
  },

  // ── AUDIO / VIDEO / MEDIA ─────────────────────────────────────────────────────
  {
    category: 'media',
    keywords: [
      /\baudio\b/i, /\bvideo\b/i, /\bmedia.process/i,
      /\bffmpeg\b/i, /\bstream\b/i, /\bpodcast\b/i,
      /\btranscri/i, /\bspeech.to.text\b/i, /\btext.to.speech\b/i,
      /\bimage.process/i, /\bcomputer.vision\b/i, /\bocr\b/i,
      /\bopencv\b/i, /\bimage.gen/i, /\bdall.e\b/i, /\bstable.diffusion\b/i,
    ],
  },
];

/**
 * Determine a category for a given skill entry.
 */
function categorize(skill) {
  // Keep explicitly categorized skills (not a catch-all) as is
  if (skill.category && skill.category !== 'uncategorized' && skill.category !== 'general') {
    return skill.category;
  }

  // ── Explicit ID overrides (highest priority) ──────────────────────────────
  const ID_MAP = {
    '00-andruia-consultant': 'consulting',
    '20-andruia-niche-intelligence': 'consulting',
    'agentfolio': 'meta-skills',
    'algorithmic-art': 'creative',
    'autonomous-agents': 'ai-ml',
    'backtesting-frameworks': 'fintech',
    'beautiful-prose': 'writing',
    'binary-analysis-patterns': 'security',
    'brainstorming': 'workflow-planning',
    'browser-extension-builder': 'developer-tools',
    'busybox-on-windows': 'developer-tools',
    'cc-skill-project-guidelines-example': 'meta-skills',
    'clean-code': 'code-quality',
    'cloudflare-workers-expert': 'cloud-devops',
    'code-refactoring-context-restore': 'code-quality',
    'code-refactoring-refactor-clean': 'code-quality',
    'code-review-excellence': 'code-quality',
    'codebase-cleanup-refactor-clean': 'code-quality',
    'competitive-landscape': 'research',
    'comprehensive-review-full-review': 'code-quality',
    'concise-planning': 'workflow-planning',
    'conductor-manage': 'workflow-planning',
    'conductor-new-track': 'workflow-planning',
    'conductor-setup': 'workflow-planning',
    'conductor-status': 'workflow-planning',
    'conductor-validator': 'workflow-planning',
    'context-compression': 'workflow-planning',
    'context-degradation': 'workflow-planning',
    'context-driven-development': 'workflow-planning',
    'context-fundamentals': 'workflow-planning',
    'context-management-context-restore': 'workflow-planning',
    'context-management-context-save': 'workflow-planning',
    'copy-editing': 'writing',
    'create-pr': 'developer-tools',
    'debugger': 'developer-tools',
    'dependency-upgrade': 'developer-tools',
    'deployment-procedures': 'cloud-devops',
    'deployment-validation-config-validate': 'cloud-devops',
    'dispatching-parallel-agents': 'ai-ml',
    'email-systems': 'marketing-growth',
    'environment-setup-guide': 'developer-tools',
    'error-detective': 'developer-tools',
    'error-handling-patterns': 'code-quality',
    'evaluation': 'ai-ml',
    'exa-search': 'research',
    'executing-plans': 'workflow-planning',
    'fal-generate': 'media',
    'fal-image-edit': 'media',
    'fal-workflow': 'media',
    'file-organizer': 'developer-tools',
    'finishing-a-development-branch': 'developer-tools',
    'firecrawl-scraper': 'research',
    'fix-review': 'code-quality',
    'framework-migration-code-migrate': 'architecture',
    'framework-migration-deps-upgrade': 'developer-tools',
    'framework-migration-legacy-modernize': 'architecture',
    'full-stack-orchestration-full-stack-feature': 'architecture',
    'gdpr-data-handling': 'security',
    'graphql': 'api',
    'haskell-pro': 'programming-languages',
    'hig-components-controls': 'mobile',
    'hig-components-dialogs': 'mobile',
    'hig-components-layout': 'mobile',
    'hig-components-menus': 'mobile',
    'hig-components-search': 'mobile',
    'hig-platforms': 'mobile',
    'hr-pro': 'hr-team',
    'hugging-face-cli': 'ai-ml',
    'hybrid-cloud-networking': 'cloud-devops',
    'interactive-portfolio': 'creative',
    'inventory-demand-planning': 'operations',
    'iterate-pr': 'developer-tools',
    'last30days': 'research',
    'launch-strategy': 'startup-business',
    'legacy-modernizer': 'architecture',
    'lint-and-validate': 'code-quality',
    'linux-troubleshooting': 'cloud-devops',
    'market-sizing-analysis': 'research',
    'memory-forensics': 'security',
    'memory-systems': 'ai-ml',
    'micro-saas-launcher': 'startup-business',
    'mtls-configuration': 'security',
    'network-101': 'networking',
    'obsidian-clipper-template-creator': 'developer-tools',
    'oss-hunter': 'developer-tools',
    'paid-ads': 'marketing-growth',
    'personal-tool-builder': 'startup-business',
    'plan-writing': 'workflow-planning',
    'planning-with-files': 'workflow-planning',
    'postgresql': 'database',
    'powershell-windows': 'developer-tools',
    'pricing-strategy': 'startup-business',
    'production-scheduling': 'operations',
    'prompt-library': 'ai-ml',
    'pypict-skill': 'testing',
    'quality-nonconformance': 'operations',
    'receiving-code-review': 'code-quality',
    'requesting-code-review': 'code-quality',
    'research-engineer': 'research',
    'returns-reverse-logistics': 'operations',
    'saga-orchestration': 'architecture',
    'sales-automator': 'marketing-growth',
    'scroll-experience': 'creative',
    'search-specialist': 'research',
    'sharp-edges': 'code-quality',
    'shodan-reconnaissance': 'security',
    'skill-creator': 'meta-skills',
    'software-architecture': 'architecture',
    'startup-business-analyst-financial-projections': 'startup-business',
    'startup-business-analyst-market-opportunity': 'startup-business',
    'startup-financial-modeling': 'fintech',
    'subagent-driven-development': 'ai-ml',
    'systematic-debugging': 'developer-tools',
    'tavily-web': 'research',
    'team-collaboration-standup-notes': 'hr-team',
    'team-composition-analysis': 'hr-team',
    'tool-design': 'ai-ml',
    'tutorial-engineer': 'content-documentation',
    'ui-skills': 'frontend',
    'unit-testing-test-generate': 'testing',
    'using-superpowers': 'meta-skills',
    'verification-before-completion': 'code-quality',
    'viral-generator-builder': 'startup-business',
    'voice-agents': 'ai-ml',
    'wiki-qa': 'research',
    'wiki-researcher': 'research',
    'wireshark-analysis': 'networking',
    'workflow-orchestration-patterns': 'cloud-devops',
    'writing-skills': 'meta-skills',
    'x-article-publisher-skill': 'marketing-growth',
  };

  if (ID_MAP[skill.id]) return ID_MAP[skill.id];

  const haystack = `${skill.id} ${skill.name || ''} ${skill.description || ''}`;

  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (kw.test(haystack)) {
        return rule.category;
      }
    }
  }

  // Fallback: attempt inference from the skill id prefix
  const idParts = skill.id.split('-');
  if (idParts.length > 1) {
    const prefix = idParts[0];
    const prefixMap = {
      react: 'frontend',
      vue: 'frontend',
      svelte: 'frontend',
      next: 'frontend',
      nuxt: 'frontend',
      angular: 'frontend',
      python: 'python',
      django: 'backend',
      flask: 'backend',
      fastapi: 'backend',
      node: 'backend',
      express: 'backend',
      nestjs: 'backend',
      rust: 'rust',
      go: 'golang',
      java: 'jvm',
      kotlin: 'jvm',
      aws: 'cloud-devops',
      azure: 'cloud-devops',
      gcp: 'cloud-devops',
      docker: 'cloud-devops',
      kubernetes: 'cloud-devops',
      k8s: 'cloud-devops',
      terraform: 'cloud-devops',
      ci: 'cloud-devops',
      git: 'developer-tools',
      github: 'developer-tools',
      vscode: 'developer-tools',
      test: 'testing',
      security: 'security',
      auth: 'auth',
      api: 'api',
      db: 'database',
      data: 'data-engineering',
      ai: 'ai-ml',
      agent: 'ai-ml',
      llm: 'ai-ml',
      mcp: 'ai-ml',
      mobile: 'mobile',
      android: 'mobile',
      ios: 'mobile',
      flutter: 'mobile',
      game: 'game-development',
    };
    if (prefixMap[prefix]) return prefixMap[prefix];
  }

  // If still not categorized, return 'general'
  return 'general';
}

function main() {
  console.log(`Reading ${SKILLS_INDEX_PATH}...`);
  const raw = fs.readFileSync(SKILLS_INDEX_PATH, 'utf8');
  const skills = JSON.parse(raw);

  let changed = 0;
  const stats = {};

  for (const skill of skills) {
    const newCat = categorize(skill);
    if (newCat !== skill.category) {
      skill.category = newCat;
      changed++;
    }
    stats[newCat] = (stats[newCat] || 0) + 1;
  }

  fs.writeFileSync(SKILLS_INDEX_PATH, JSON.stringify(skills, null, 2), 'utf8');

  console.log(`\nDone. ${changed} skills re-categorized.\n`);
  console.log('Category breakdown:');
  const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sorted) {
    console.log(`  ${cat.padEnd(30)} ${count}`);
  }

  // Check for remaining uncategorized
  const remaining = skills.filter((s) => s.category === 'uncategorized').length;
  if (remaining > 0) {
    console.log(`\nWARNING: ${remaining} skills are still 'uncategorized'.`);
    const sample = skills.filter((s) => s.category === 'uncategorized').slice(0, 10);
    console.log('Sample:', sample.map((s) => s.id));
  } else {
    console.log('\nAll skills are now categorized!');
  }
}

main();
