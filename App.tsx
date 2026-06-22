import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Star, Crown, Lock, Calendar, Award, Zap, Heart, Sparkles, AlertTriangle, ChevronRight, Clock, Shield, Loader2 } from 'lucide-react';

const HOTMART_URL = 'https://pay.hotmart.com/PLACEHOLDER_COMBO_7?off=PLACEHOLDER';
const WEBHOOK_GHL = 'https://services.leadconnectorhq.com/hooks/k6QjNd1AOBLWkKhLvIP3/webhook-trigger/0a6fc78c-01d7-481a-9e6e-9a1e951eef4a';
const DASHBOARD_WEBHOOK_COMBO = 'https://mighty-dont-supplemental-perfume.trycloudflare.com/api/inscricao-combo';

function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}
function getFbp() { return getCookie('_fbp'); }
function getFbc() {
  const c = getCookie('_fbc');
  if (c) return c;
  if (typeof window === 'undefined') return '';
  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : '';
}

type FormData = { nome: string; email: string; whatsapp: string };

function buildCheckoutUrl(data: FormData): string {
  if (typeof window === 'undefined') return HOTMART_URL;
  const utm = window.location.search.replace('?', '');
  const sep = HOTMART_URL.includes('?') ? '&' : '?';
  const params = new URLSearchParams();
  if (utm) {
    new URLSearchParams(utm).forEach((v, k) => params.append(k, v));
  }
  if (data.nome) params.append('name', data.nome);
  if (data.email) params.append('email', data.email);
  if (data.whatsapp) params.append('phone', data.whatsapp.replace(/\D/g, ''));
  return `${HOTMART_URL}${sep}${params.toString()}`;
}

let CTX_SET_OPEN: ((v: boolean) => void) | null = null;
function openCheckoutForm() {
  if (CTX_SET_OPEN) CTX_SET_OPEN(true);
}

const CURSOS = [
  {
    nome: 'Coleção Preciosidades',
    desc: 'Peças sacras de alta percepção de valor. A base do ateliê da Rita.',
    img: '/img/pecas/preciosidades-01.jpg',
    modulos: [
      'Aparecida com customização chaton e pedrarias (peça de gesso vira joia)',
      'Forração francesa (caixas, altares, Bíblia forrada)',
      'Linha de armados (ramos de flores pra altar, escapulários, quadros)',
      'Tesouro do Ateliê / linha de pedrarias (pingentes, colares, escapulários, modelo de terço)',
      'Marcadores e chaveiros (reaproveitamento de material)',
      'Lista secreta de fornecedores (atacado)',
    ],
    pilares: ['Base estrutural', 'Precificação e venda', 'Acabamento premium com valor percebido elevado'],
    projecao: 'Custo material a partir de R$ 20 · Lucro líquido R$ 135 por peça · Venda R$ 150-350 · Com 3 peças o curso se paga',
    ia: { nome: 'IA Mentora Preciosidades', desc: 'Te ajuda a precificar cada peça e responde dúvidas sobre customização chaton, pedrarias e forração 24h por dia.' },
  },
  {
    nome: 'Técnicas Monocromáticas',
    desc: 'Acabamento sofisticado em uma única cor. Mármore, bronze, madeira.',
    img: '/img/pecas/monocromaticas-new.jpg',
    modulos: [
      'Base: preparação e reparos no gesso/resina',
      'Tipos de betume (qual usa pra que)',
      'Branco com envelhecimento',
      'Técnica do urso (com envelhecimento e dourado)',
      'Efeito madeira em várias formas (adaptáveis ao material da região)',
      'Porcelana portuguesa (tinta óleo)',
      'Pedra (tinta óleo e acrílica)',
      'Ouro velho, Provençal, Monocromática em óleo, Efeito mármore',
      'Monte Sant\'Angelo / Gargano (mármore branco polido)',
      'Prata velho ouro, Polimento em resina, Dourados, Terracota',
      'Madeira nobre, Técnica Veronese, Efeito laca',
      'Bônus: Lista premium de fornecedores',
    ],
    projecao: 'Valor percebido por peça R$ 350-800 · Margem R$ 190 por peça · Faturamento potencial R$ 3.100-6.500/mês · Com 2 peças o curso se paga',
    ia: { nome: 'IA Mentora Monocromática', desc: 'Sugere combinações de cor, tipo de betume ideal pra cada efeito e te orienta na sequência de aplicação das camadas.' },
  },
  {
    nome: 'Nossa Senhora de Guadalupe',
    desc: 'A imagem mais pedida do Brasil. Do começo ao fim, com customização exclusiva.',
    img: '/img/pecas/guadalupe-01.jpg',
    modulos: [
      'Preparo da peça',
      'Receitas utilizadas',
      'Pintura tradicional (versão clássica)',
      'Betume e polimento',
      'Contornos e detalhes',
      'Técnica do Esponjado (diferencial pouco conhecida no Brasil): pintura, esponjando, decoupage, dourado, colagens de chaton, betume e finalização',
      'Decoupage com Efeito Porcelana (pra quem não quer fazer rostinho): base, aplicação de decoupage e efeito porcelana',
    ],
    projecao: 'Custo de produção ~R$ 40 · Venda ~R$ 250 · Lucro R$ 210 por peça · 10 peças/mês = R$ 2.100 de renda extra',
    ia: { nome: 'IA Mentora Guadalupe', desc: 'Te conta a narrativa devocional da imagem pra você vender com história e responde dúvidas sobre cada técnica.' },
  },
  {
    nome: 'Degradê',
    desc: 'O método das 3 camadas. A tinta certa, a ordem certa, o tempo certo.',
    img: '/img/pecas/degrade-new.jpg',
    modulos: [
      'Degradê em tinta acrílica fosca (Nossa Senhora Aparecida)',
      'Degradê em tinta metálica (degradê incrível)',
      'Envelhecimento sobre degradê',
      'Degradê em tinta a óleo (mais fácil pro degradê, segundo a Rita)',
      'Material de apoio: apostila no final de cada técnica',
    ],
    projecao: 'Técnica de diferenciação grande na peça · "Chove de comentários" quando aparece · Aluno entra fazendo nada e sai fazendo peças vendáveis',
    ia: { nome: 'IA Calibrador de Camadas', desc: 'Te orienta no tempo entre camadas, escolha da tinta certa pra cada efeito e correção quando borrar.' },
  },
  {
    nome: 'Customize',
    desc: 'Personalização avançada de imagens religiosas. Transforma uma peça padrão em arte única.',
    img: '/img/pecas/customize-new.jpg',
    modulos: [
      'Fundação: cores e brancos, dourados, impermeabilização do gesso, PVA x acrílica, reparos no gesso',
      'N. Sra. Aparecida com manto em renda (iniciante mas requintada)',
      'Aplicação de renda em geral',
      'Customização com flores',
      'Customização com pérolas (cartela e soltas)',
      'Pintura dourada',
      'Mosaico de pérolas (pérolas soltas se encaixando)',
      'Renda com florzinhas soltas (redinha soltinha)',
      'Pintura branca que não amarela',
      'Pintura pérola com forração do manto em linho',
      'Técnica de Copa (decoupagem com guardanapos)',
    ],
    projecao: 'Venda ~R$ 200 por peça · Custo material ~R$ 50 · Faturamento R$ 2.800-6.200/mês · Com 3 peças o curso se paga',
    ia: { nome: 'IA Pérolas & Padrões', desc: 'Sugere combinação de pérolas, rendas e tecidos pra cada tipo de peça e te ajuda no orçamento de material.' },
  },
  {
    nome: 'Combo 4 Cursos (Mini Combo)',
    desc: 'Os 4 cursos essenciais agrupados. Base sólida pra começar.',
    img: '/img/pecas/combo4-new.jpg',
    modulos: [
      'Sagrada Família: pintura perolada, betume sem erros, técnica básica de rostos, dourado, envelhecimento',
      'Santa Rita (Pintura a Óleo): introdução à óleo, luz e sombra, acabamento elegante',
      'Monocromática Veronese: pintura monocromática, envelhecimento, mix de ceras',
      'Pincel Seco + Efeito Mármore: profundidade, realce de luz, efeito mármore, acabamento profissional',
    ],
    projecao: 'Custo por peça ~R$ 40 · Venda ~R$ 250 · 10 peças/mês = até R$ 2.100/mês',
    ia: { nome: 'IA Mentora de Bolso', desc: 'Te tira dúvida 24h em qualquer um dos 4 cursos, sugere ordem de estudo e calcula preço de cada peça.' },
  },
  {
    nome: 'Do Altar ao Lar',
    desc: 'O ecossistema completo pra atender noivas católicas. Coleção que noiva paga acima de R$ 2.000.',
    img: '/img/pecas/peca-01.jpg',
    modulos: [
      'Aulas AO VIVO: Altar (porta-aliança que vira altar) e Terço Bordado',
      'Coleção completa gravada das 5 peças (altar, terço bordado, caixa de padrinhos com tampo acrílico, porta-aliança com forração francesa, caixa acrílica multifuncional)',
      'Aula de POSICIONAMENTO no mercado de noivas católicas',
      'Aula de COMO ATENDER A NOIVA (perguntas, fundamentos, cuidados)',
      '2 TÉCNICAS DE PINTURA (polimento + finalização brilhante)',
      'Aula de CUSTOMIZAÇÃO da imagem',
      'LINK DE PRECIFICAÇÃO pra calcular preço de cada peça',
      'Grupo exclusivo de alunas + indicação de fornecedores',
    ],
    projecao: 'Coleção que noiva paga acima de R$ 2.000 · Ticket médio do nicho de noiva R$ 1.500-4.000 por noiva atendida',
    ia: { nome: 'IA Atendimento Noiva', desc: 'Te dá script de atendimento, calcula orçamento da coleção da noiva e responde dúvidas sobre posicionamento no mercado nupcial.' },
  },
];

const GALERIA_PECAS = [
  '/img/galeria-nova/galeria-01.jpg',
  '/img/galeria-nova/galeria-02.jpg',
  '/img/galeria-nova/galeria-03.jpg',
  '/img/galeria-nova/galeria-04.jpg',
  '/img/galeria-nova/galeria-05.jpg',
  '/img/galeria-nova/galeria-06.jpg',
  '/img/galeria-nova/galeria-07.jpg',
  '/img/galeria-nova/galeria-08.jpg',
  '/img/galeria-nova/galeria-09.jpg',
  '/img/galeria-nova/galeria-10.jpg',
  '/img/galeria-nova/galeria-11.jpg',
  '/img/galeria-nova/galeria-12.jpg',
];

function TopBanner() {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-[#A8261E] via-[#B3541E] to-[#A8261E] text-white py-2 px-4 text-center shadow-lg">
      <p className="text-xs md:text-sm font-bold tracking-wide uppercase">
        ⚠️ VAGAS LIMITADAS · Garanta a sua antes de esgotar
      </p>
    </div>
  );
}

function Btn({ children, large = false }: { children: React.ReactNode; large?: boolean }) {
  return (
    <button
      onClick={openCheckoutForm}
      className={`group inline-flex items-center justify-center gap-2 font-bold text-white bg-gradient-to-br from-[#B3541E] to-[#A8261E] hover:from-[#C5631E] hover:to-[#B3361E] shadow-2xl shadow-[#B3541E]/30 rounded-full transition-all hover:scale-105 active:scale-95 ${
        large ? 'px-8 py-5 text-lg md:text-xl' : 'px-6 py-3 text-base'
      }`}
    >
      {children}
      <ChevronRight className="group-hover:translate-x-1 transition-transform" size={large ? 24 : 18} />
    </button>
  );
}

function CheckoutFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<FormData>({ nome: '', email: '', whatsapp: '' });
  const [submitting, setSubmitting] = useState(false);

  const formatWA = (v: string) => {
    const n = v.replace(/\D/g, '');
    if (n.length <= 2) return n;
    if (n.length <= 7) return `(${n.slice(0,2)}) ${n.slice(2)}`;
    return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7,11)}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const cleanPhone = form.whatsapp.replace(/\D/g, '');
      const urlParams = new URLSearchParams(window.location.search);
      const payload = new URLSearchParams({
        nome: form.nome,
        email: form.email,
        phone: cleanPhone,
        timestamp: new Date().toISOString(),
        utm_source: urlParams.get('utm_source') || '',
        utm_medium: urlParams.get('utm_medium') || '',
        utm_campaign: urlParams.get('utm_campaign') || '',
        utm_content: urlParams.get('utm_content') || '',
        utm_term: urlParams.get('utm_term') || '',
        referrer: document.referrer || '',
        fbp: getFbp(),
        fbc: getFbc(),
        fbclid: urlParams.get('fbclid') || '',
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(DASHBOARD_WEBHOOK_COMBO, payload);
        navigator.sendBeacon(WEBHOOK_GHL, payload);
      } else {
        fetch(DASHBOARD_WEBHOOK_COMBO, { method: 'POST', body: payload, keepalive: true }).catch(() => {});
        fetch(WEBHOOK_GHL, { method: 'POST', body: payload, keepalive: true }).catch(() => {});
      }

      if (typeof (window as any).fbq === 'function') {
        (window as any).fbq('track', 'InitiateCheckout');
      }
    } catch (e) {
      console.error('webhook err', e);
    }

    window.location.href = buildCheckoutUrl(form);
  };

  function getCookie(name: string): string {
    if (typeof document === 'undefined') return '';
    const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  function getFbp() { return getCookie('_fbp'); }
  function getFbc() {
    const c = getCookie('_fbc');
    if (c) return c;
    if (typeof window === 'undefined') return '';
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    return fbclid ? `fb.1.${Date.now()}.${fbclid}` : '';
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#F5EFE6] hover:bg-[#E8DFD0] text-[#3D3D3D] flex items-center justify-center">
          <X size={18} />
        </button>
        <div className="text-center mb-5">
          <h3 className="text-2xl md:text-3xl font-bold text-[#3D3D3D] mb-1">Garantir meu combo</h3>
          <p className="text-sm text-[#5C4033]">Preencha pra ir direto pro pagamento Hotmart</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Seu nome completo"
            value={form.nome}
            onChange={e => setForm({ ...form, nome: e.target.value })}
            className="w-full px-4 py-3 border-2 border-[#E8DFD0] focus:border-[#C5A059] rounded-xl text-[#3D3D3D] placeholder-[#8B7355] outline-none transition-colors"
          />
          <input
            type="email"
            required
            placeholder="Seu melhor email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 border-2 border-[#E8DFD0] focus:border-[#C5A059] rounded-xl text-[#3D3D3D] placeholder-[#8B7355] outline-none transition-colors"
          />
          <input
            type="tel"
            required
            inputMode="numeric"
            placeholder="WhatsApp com DDD"
            value={form.whatsapp}
            onChange={e => setForm({ ...form, whatsapp: formatWA(e.target.value) })}
            className="w-full px-4 py-3 border-2 border-[#E8DFD0] focus:border-[#C5A059] rounded-xl text-[#3D3D3D] placeholder-[#8B7355] outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-br from-[#B3541E] to-[#A8261E] hover:from-[#C5631E] hover:to-[#B3361E] text-white font-bold text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 size={20} className="animate-spin" /> Indo pro checkout...</> : <>IR PRO PAGAMENTO <ChevronRight size={20} /></>}
          </button>
        </form>
        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-[#5C4033]">
          <span className="flex items-center gap-1"><Lock size={12} /> Seguro Hotmart</span>
          <span>•</span>
          <span>R$ 697 à vista ou 12x R$ 72,09</span>
        </div>
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#A8261E]/10 border border-[#A8261E]/30 rounded-full mb-4">
      <Sparkles size={14} className="text-[#A8261E]" />
      <span className="text-xs md:text-sm font-bold text-[#A8261E] uppercase tracking-wider">{children}</span>
    </div>
  );
}

// =================== DOBRA 1 — PROMESSA ===================
function Dobra1Promessa() {
  return (
    <section className="relative py-12 md:py-20 px-4 bg-gradient-to-b from-[#1F1B16] to-[#2C2620] text-white overflow-hidden">
      <div className="absolute top-10 right-10 w-72 h-72 bg-[#C5A059] opacity-10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-[#A8261E] opacity-10 rounded-full blur-3xl" />
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#A8261E] rounded-full mb-6 animate-pulse">
              <Zap size={14} className="text-white" />
              <span className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">🔥 VAGAS LIMITADAS</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Tenha acesso em <span className="text-[#C5A059]">1ª mão</span> à <span className="italic text-[#C5A059] font-serif">Coleção Diamante 💎</span>
            </h1>
            <p className="text-lg md:text-xl text-[#D4C4A8] mb-8 leading-relaxed">
              Domine TODOS os caminhos do artesanato sacro católico em UM combo de 7 cursos completos.
            </p>
            <div className="flex flex-col items-center md:items-start gap-4">
              <Btn large>QUERO A COLEÇÃO COMPLETA POR 12x DE R$ 72,09</Btn>
              <p className="text-sm text-[#C5A059]">ou 12x R$ 72,09 no cartão · Acesso imediato</p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#C5A059]/30 to-[#A8261E]/30 rounded-3xl blur-2xl" />
            <img
              src="/img/rita/rita-01.jpg"
              alt="Rita Machado"
              className="relative rounded-3xl shadow-2xl w-full max-w-md mx-auto border-4 border-[#C5A059]/40"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// =================== GALERIA DE PEÇAS (após Dobra 2) ===================
function GaleriaPecas() {
  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-[#FDF9F3] to-[#F5EFE6]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Eyebrow>Peças que minhas alunas aprendem a fazer</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-bold text-[#3D3D3D] mb-4">
            Veja algumas das <span className="text-[#B3541E]">peças do método</span>
          </h2>
          <p className="text-lg text-[#5C4033] max-w-2xl mx-auto">
            Cada uma dessas peças é ensinada do início ao fim em um dos 7 cursos do combo. Da preciosa Aparecida à Guadalupe, dos tons monocromáticos ao degradê.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {GALERIA_PECAS.map((src, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-[#E8DFD0]">
              <img src={src} alt={`Peça ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================== DOBRA 2 — PROVA SOCIAL ===================
const DEPOIMENTOS_DOBRA_2 = [
  { nome: 'Marciela', texto: 'Eu já vendo minhas peças desde 2017.' },
  { nome: 'Contas de Maria · Terços Personalizados', texto: 'Eu vendo sim, inclusive nunca pensei no sucesso que teria meus Terços. Moro em uma cidade pequena no interior de SP.' },
  { nome: 'Maria Virginia · Artesanato', texto: 'Já tenho o curso de Customização completo, mas vou renovar. Como gostei das monocromáticas, vi muita vantagem em adquirir esse módulo separado e principalmente, vitalício.' },
];

function Dobra2ProvaSocial() {
  return (
    <section className="py-16 md:py-20 px-4 bg-[#FDF9F3]">
      <div className="container mx-auto max-w-5xl text-center">
        <Eyebrow>Centenas de mulheres transformadas</Eyebrow>
        <h2 className="text-3xl md:text-5xl font-bold text-[#3D3D3D] mb-4">
          Mulheres reais que <span className="text-[#B3541E]">já estão vivendo do artesanato</span> com o método Rita Machado
        </h2>
        <p className="text-lg text-[#5C4033] mb-12 max-w-3xl mx-auto">
          Vendendo peças, construindo ateliê, renovando os cursos a cada ano, escalando o trabalho. Essas são alunas REAIS que mandaram mensagem direto pra Rita.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {DEPOIMENTOS_DOBRA_2.map((d, i) => (
            <div key={i} className="bg-white border-2 border-[#E8DFD0] rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow text-left">
              <div className="flex gap-1 text-[#C5A059] mb-3">
                {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="#C5A059" />)}
              </div>
              <p className="text-[#3D3D3D] leading-relaxed font-serif italic mb-4">"{d.texto}"</p>
              <p className="text-sm font-bold text-[#B3541E]">— {d.nome}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================== BANNER INTERMEDIARIO (apos Dobra 6) — TRANSFORMAÇOES ===================
const DEPOIMENTOS_INTER = [
  { nome: 'Nancy', texto: 'Inspirei minha filha que está deslumbrada na arte sacra, comprei o último curso da Rita pra ela, já está produzindo peças lindas.' },
  { nome: 'Antonio', texto: 'Comecei fazendo terços, passei para terços personalizados e hoje faço pintura de imagens e customização com pérolas.' },
  { nome: 'Mimo Arte em Caixas', texto: 'Com o curso que adquiri aprendi a observar as peças cru com mais atenção.' },
];

function BannerDepoimentosTransformacao() {
  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-[#3D3D3D] to-[#1F1B16] text-white">
      <div className="container mx-auto max-w-5xl text-center">
        <Eyebrow>De iniciante a profissional</Eyebrow>
        <h2 className="text-3xl md:text-5xl font-bold mb-12">
          Trajetórias reais de alunas que <span className="text-[#C5A059]">subiram de nível</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {DEPOIMENTOS_INTER.map((d, i) => (
            <div key={i} className="bg-[#2C2620] border border-[#C5A059]/30 rounded-2xl p-6 shadow-xl text-left">
              <div className="flex gap-1 text-[#C5A059] mb-3">
                {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="#C5A059" />)}
              </div>
              <p className="text-white leading-relaxed font-serif italic mb-4">"{d.texto}"</p>
              <p className="text-sm font-bold text-[#C5A059]">— {d.nome}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================== BANNER REFORCO (apos Dobra 9) — LEALDADE/GRATIDAO ===================
const DEPOIMENTOS_REFORCO = [
  { nome: 'Pérola Santa Artesanato', texto: 'Já comprei curso com a professora Rita, aprendi muito com ela. Amo o trabalho dela.' },
  { nome: 'Cláudio', texto: 'Já sou aluno dela há 3 anos, aprendi muito com ela e vou aprender sempre mais.' },
  { nome: 'Milena', texto: 'Já fiz um curso com a professora e amei demais. Qualquer hora voltarei a ser aluna dela, amo todas as criações dela.' },
  { nome: 'Terços de Noiva e Luxo', texto: 'Professora Rita, muito obrigada. Sou muito grata pela sua atenção, paciência e generosidade em compartilhar seu conhecimento.' },
];

function BannerDepoimentosLealdade() {
  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-[#F5EFE6] to-[#FDF9F3]">
      <div className="container mx-auto max-w-5xl text-center">
        <Eyebrow>Alunas que voltam ano após ano</Eyebrow>
        <h2 className="text-3xl md:text-5xl font-bold text-[#3D3D3D] mb-12">
          A relação que se constrói <span className="text-[#B3541E]">com o método Rita</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEPOIMENTOS_REFORCO.map((d, i) => (
            <div key={i} className="bg-white border-2 border-[#E8DFD0] rounded-2xl p-5 shadow-md text-left">
              <div className="flex gap-1 text-[#C5A059] mb-3">
                {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="#C5A059" />)}
              </div>
              <p className="text-[#3D3D3D] leading-relaxed font-serif italic text-sm md:text-base mb-3">"{d.texto}"</p>
              <p className="text-xs font-bold text-[#B3541E]">— {d.nome}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================== DOBRA 3 — APERTAR PEDRA ===================
function Dobra3ApertarPedra() {
  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-[#FDF9F3] to-[#F5EFE6]">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <Eyebrow>De artesã iniciante a artesã COMPLETA</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-bold text-[#3D3D3D]">
            1 curso te ensina uma técnica. <span className="text-[#B3541E]">Esse combo</span> eleva seu padrão de excelência pra você se tornar uma <span className="text-[#B3541E]">artesã completa</span>, vivendo exclusivamente do artesanato.
          </h2>
        </div>
        <div className="space-y-4">
          {[
            'Pintar uma peça e ela borrar do nada.',
            'Tentar vender e a cliente sumir sem dar explicação.',
            'Cobrar R$ 200 por um trabalho que vale R$ 2.000.',
            'Ver outras artesãs faturando alto enquanto você não consegue precificar direito.',
            'Aprender uma técnica de um curso, mas faltar atendimento. Faltar posicionamento. Faltar o caminho inteiro.',
            'Aprender só uma técnica e travar quando o cliente pedir algo de outra área.',
          ].map((d, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border border-[#E8DFD0] rounded-xl p-4 shadow-sm">
              <X className="shrink-0 text-[#A8261E] mt-1" size={20} />
              <p className="text-[#3D3D3D] leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 bg-[#3D3D3D] text-white rounded-2xl p-6 md:p-8 text-center">
          <p className="text-lg md:text-xl leading-relaxed font-serif italic">
            O nicho do artesanato sacro católico não funciona em peças soltas. Funciona em ECOSSISTEMA. Quem quer realmente viver disso precisa <span className="text-[#C5A059] font-bold">DOMINAR o ecossistema todo</span>.
          </p>
        </div>
      </div>
    </section>
  );
}

// =================== DOBRA 4 — TRANSIÇÃO 5 MOTIVOS ===================
function Dobra4Transicao() {
  const motivos = [
    { titulo: 'Caminho completo, não retalho', desc: 'Os 7 cursos cobrem do iniciante ao avançado, de altar a terço, de monocromático a degradê, de customização a posicionamento.' },
    { titulo: 'Vitalício', desc: 'Você assiste, pausa, revisa, volta no seu ritmo, pra sempre. Sem mensalidade. Sem data de expiração.' },
    { titulo: 'Preço de UM curso, leva os 7', desc: 'Cada um vale R$ 297. Hoje, na live, leva os 7 por R$ 697. Economia de R$ 1.382. Não tem como repetir esse preço.' },
    { titulo: 'Acesso à Coleção Diamante completa', desc: 'Você leva os 7 cursos vitalícios da Coleção — e como o Combo 4 Cursos (Mini Combo) traz dentro dele Sagrada Família, Santa Rita Óleo, Monocromática Veronese e Pincel Seco + Efeito Mármore, na prática você sai com 10 cursos no total. Tudo gravado, organizado, no seu ritmo, pra sempre.' },
    { titulo: 'Vagas limitadas pra essa live', desc: 'Não é um produto disponível na vitrine. É exclusivo pra quem está aqui agora. Quando a live acabar OU os ingressos esgotarem, encerra. Sem volta.' },
  ];
  return (
    <section className="py-16 md:py-20 px-4 bg-[#FDF9F3]">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <Eyebrow>5 motivos pra você levar o combo HOJE</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-bold text-[#3D3D3D]">
            Por que <span className="text-[#B3541E]">esse combo</span> é diferente
          </h2>
        </div>
        <div className="space-y-4">
          {motivos.map((m, i) => (
            <div key={i} className="flex gap-4 bg-white border-2 border-[#E8DFD0] rounded-2xl p-6 shadow-md hover:border-[#C5A059] transition-all">
              <div className="shrink-0 w-12 h-12 bg-gradient-to-br from-[#B3541E] to-[#A8261E] text-white font-bold text-xl rounded-full flex items-center justify-center">
                {i + 1}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#3D3D3D] mb-2">{m.titulo}</h3>
                <p className="text-[#5C4033] leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================== DOBRA 5 — PASSO A PASSO ===================
function Dobra5PassoAPasso() {
  const passos = [
    { titulo: 'Você se inscreve hoje', desc: 'Recebe acesso imediato à plataforma Hotmart, login e senha.' },
    { titulo: 'Começa pelo curso que mais te chama', desc: 'Pode ser por tema (sacro, noivas, customização) ou pela ordem que a Rita indica (iniciante → avançado).' },
    { titulo: 'Assiste no seu ritmo', desc: 'Pausa, revisa, anota. Cada curso é gravado em qualidade profissional com timeline organizada.' },
    { titulo: 'Aplica e vende', desc: 'Cada curso te dá peças pra produzir e método pra precificar e atender. Quando terminar, vai dominar o nicho inteiro.' },
    { titulo: 'Acesso pra sempre', desc: 'Você volta sempre que precisar. Quando aparecer cliente novo pedindo algo específico, você abre o curso e revisa.' },
  ];
  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-[#F5EFE6] to-[#EBE5D9]">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <Eyebrow>Como você vai usar na prática</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-bold text-[#3D3D3D]">
            Em 5 <span className="text-[#B3541E]">passos simples</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {passos.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-md border-l-4 border-[#C5A059]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#C5A059] text-white font-bold rounded-full flex items-center justify-center">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold text-[#3D3D3D]">{p.titulo}</h3>
              </div>
              <p className="text-[#5C4033] leading-relaxed text-sm">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================== DOBRA 6 — TUDO QUE RECEBE ===================
function CursoAccordionCard({ curso, isOpen, onToggle }: { curso: typeof CURSOS[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="bg-gradient-to-r from-white to-[#F5EFE6] border-2 border-[#E8DFD0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-stretch gap-4">
        <div className="shrink-0 w-24 md:w-32 relative">
          <img src={curso.img} alt={curso.nome} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="flex-1 p-4 md:p-5">
          <div className="flex items-start gap-3 mb-2">
            <div className="shrink-0 w-8 h-8 bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white rounded-full flex items-center justify-center">
              <Check size={16} strokeWidth={3} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-base md:text-xl font-bold text-[#3D3D3D]">{curso.nome}</h3>
                <span className="text-xs md:text-sm font-bold text-[#A8261E] bg-[#A8261E]/10 border border-[#A8261E]/30 px-3 py-1 rounded-full whitespace-nowrap">R$ 297 / ano</span>
              </div>
              <p className="text-sm text-[#5C4033] leading-relaxed mt-1">{curso.desc}</p>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`w-full px-4 py-3 md:py-4 font-bold text-sm md:text-base text-white transition-all flex items-center justify-center gap-2 ${
          isOpen
            ? 'bg-gradient-to-r from-[#3D3D3D] to-[#1F1B16]'
            : 'bg-gradient-to-r from-[#B3541E] to-[#A8261E] hover:from-[#C5631E] hover:to-[#B3361E] animate-pulse'
        }`}
      >
        {isOpen ? (
          <>FECHAR DETALHES <ChevronRight size={18} className="rotate-90" /></>
        ) : (
          <>👆 TOQUE AQUI PRA VER TUDO SOBRE ESSE CURSO <ChevronRight size={18} className="rotate-90" /></>
        )}
      </button>
      {isOpen && (
        <div className="px-5 md:px-8 py-6 bg-[#FDF9F3] border-t-2 border-[#C5A059]/30 space-y-5">
          <div>
            <h4 className="text-sm font-bold text-[#B3541E] uppercase tracking-wider mb-3">📚 O que você vai aprender</h4>
            <ul className="space-y-2">
              {curso.modulos.map((m, j) => (
                <li key={j} className="flex gap-2 text-sm md:text-base text-[#3D3D3D] leading-relaxed">
                  <Check className="shrink-0 text-[#22C55E] mt-1" size={16} />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
          {curso.pilares && (
            <div>
              <h4 className="text-sm font-bold text-[#B3541E] uppercase tracking-wider mb-3">🏛️ Pilares do método</h4>
              <ul className="space-y-2">
                {curso.pilares.map((p, j) => (
                  <li key={j} className="flex gap-2 text-sm md:text-base text-[#3D3D3D]">
                    <span className="text-[#C5A059] font-bold">{j+1}.</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-xl p-4">
            <h4 className="text-sm font-bold text-[#C5A059] uppercase tracking-wider mb-2">💎 Projeção financeira</h4>
            <p className="text-sm text-[#3D3D3D] leading-relaxed">{curso.projecao}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1F1B16] to-[#3D3D3D] text-white rounded-xl p-4 md:p-5 border-2 border-[#C5A059]/50">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-[#C5A059] to-[#B3541E] rounded-full flex items-center justify-center text-xl">
                🤖
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#C5A059] uppercase tracking-wider mb-1">IA DE BÔNUS · EXCLUSIVA DO COMBO</p>
                <h5 className="text-base md:text-lg font-bold mb-1">{curso.ia.nome}</h5>
                <p className="text-sm text-[#D4C4A8] leading-relaxed">{curso.ia.desc}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Dobra6TudoQueRecebe() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <section className="py-16 md:py-20 px-4 bg-[#FDF9F3]">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <Eyebrow>Cada curso vale R$ 297 / ano · Você leva os 7 PRA SEMPRE por R$ 697</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-bold text-[#3D3D3D] mb-4">
            Os <span className="text-[#B3541E]">7 cursos vitalícios</span> que você leva no combo
          </h2>
          <p className="text-base md:text-lg text-[#5C4033] max-w-2xl mx-auto">
            Pagando avulso, cada um custa <span className="font-bold text-[#A8261E]">R$ 297 por ano</span>. Multiplicado pelos 7, dá <span className="font-bold text-[#A8261E]">R$ 2.079 todo ano</span>. Hoje, vitalício, UMA ÚNICA VEZ, leva os 7 por R$ 697.
          </p>
          <p className="text-sm text-[#8B7355] italic mt-4">👆 Toque em cada curso pra ver tudo o que vem dentro + a IA de bônus</p>
        </div>
        <div className="space-y-3">
          {CURSOS.map((c, i) => (
            <CursoAccordionCard
              key={i}
              curso={c}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </div>
        <div className="mt-10 bg-gradient-to-br from-[#1F1B16] to-[#2C2620] text-white rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="text-center space-y-3">
            <p className="text-[#D4C4A8] text-sm md:text-base uppercase tracking-wider">Se você fosse pagar avulso</p>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto py-4">
              <div className="bg-[#3D3D3D]/40 rounded-2xl p-4">
                <p className="text-[#D4C4A8] text-xs uppercase mb-1">Por ano</p>
                <p className="text-2xl md:text-3xl font-bold text-[#A8261E]">R$ 2.079</p>
                <p className="text-xs text-[#D4C4A8]">(7 × R$ 297)</p>
              </div>
              <div className="bg-[#3D3D3D]/40 rounded-2xl p-4">
                <p className="text-[#D4C4A8] text-xs uppercase mb-1">7 cursos em 5 anos</p>
                <p className="text-2xl md:text-3xl font-bold text-[#A8261E]">R$ 10.395</p>
                <p className="text-xs text-[#D4C4A8]">(R$ 2.079 × 5 anos)</p>
              </div>
            </div>
            <div className="my-6 border-t border-[#3D3D3D]" />
            <p className="text-[#C5A059] text-lg uppercase tracking-wider font-bold">INSCREVA-SE AGORA</p>
            <p className="text-5xl md:text-7xl font-bold text-[#22C55E]">R$ 697</p>
            <p className="text-lg md:text-xl text-white">à vista <span className="text-[#D4C4A8]">ou apenas</span></p>
            <p className="text-3xl md:text-5xl font-bold text-[#22C55E]">12x R$ 72,09</p>
            <p className="text-base md:text-lg text-white">com <span className="text-[#C5A059] font-bold">acesso vitalício</span> 💎</p>
            <p className="text-sm text-[#22C55E] font-bold uppercase mt-3">Economia em 5 anos: R$ 9.698 (93% off)</p>
            <div className="pt-4">
              <Btn large>QUERO A COLEÇÃO COMPLETA POR 12x DE R$ 72,09</Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =================== DOBRA 7 — PARA QUEM SERVE ===================
function Dobra7ParaQuemServe() {
  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-[#FDF9F3] to-[#F5EFE6]">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <Eyebrow>Esse combo é pra você?</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-bold text-[#3D3D3D]">
            Pra quem <span className="text-[#22C55E]">É</span> e pra quem <span className="text-[#A8261E]">NÃO É</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#22C55E]/10 to-white border-2 border-[#22C55E] rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-[#16A34A] mb-4 flex items-center gap-2">
              <Check size={24} /> É pra você se:
            </h3>
            <ul className="space-y-3">
              {[
                'Quer VIVER do artesanato sacro católico, não só fazer hobby',
                'Está cansada de aprender uma técnica e travar nas outras 6',
                'Quer DOMINAR todo o ecossistema (sacro, noivas, customização, posicionamento)',
                'Quer pagar UMA vez e ter acesso PRA SEMPRE, sem mensalidade',
                'Está disposta a aplicar (não é fórmula mágica, é método)',
              ].map((d, i) => (
                <li key={i} className="flex gap-2 text-[#3D3D3D] text-sm leading-relaxed">
                  <Check className="shrink-0 text-[#22C55E] mt-0.5" size={18} />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-[#A8261E]/10 to-white border-2 border-[#A8261E] rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-[#A8261E] mb-4 flex items-center gap-2">
              <X size={24} /> NÃO é pra você se:
            </h3>
            <ul className="space-y-3">
              {[
                'Só quer um curso pra fazer 1 peça pra você (compra avulso, sai mais barato)',
                'Não quer praticar (a Rita ensina, mas você precisa pegar o pincel)',
              ].map((d, i) => (
                <li key={i} className="flex gap-2 text-[#3D3D3D] text-sm leading-relaxed">
                  <X className="shrink-0 text-[#A8261E] mt-0.5" size={18} />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// =================== DOBRA 8 — ANCORAGEM 5 ANOS ===================
function Dobra8Ancoragem() {
  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-[#1F1B16] to-[#2C2620] text-white">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <Eyebrow>Cálculo honesto de 5 anos</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Vamos fazer uma <span className="text-[#C5A059]">conta honesta</span>
          </h2>
          <p className="text-lg text-[#D4C4A8] max-w-2xl mx-auto">
            Esse combo é VITALÍCIO. Acesso pra SEMPRE. Vou te mostrar quanto isso vale projetando 5 anos.
          </p>
        </div>
        <div className="bg-[#3D3D3D] rounded-2xl p-6 md:p-8 mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-[#C5A059] mb-6 text-center">
            Se você fosse comprar AVULSO E renovar por 5 anos:
          </h3>
          <div className="space-y-3 max-w-xl mx-auto">
            <div className="flex justify-between items-center bg-[#2C2620] rounded-lg p-4">
              <span className="text-white">7 cursos × R$ 297</span>
              <span className="text-[#C5A059] font-bold">R$ 2.079 / ano</span>
            </div>
            <div className="flex justify-between items-center bg-[#2C2620] rounded-lg p-4">
              <span className="text-white">Multiplicado por 5 anos</span>
              <span className="text-[#A8261E] font-bold text-xl">R$ 10.395</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#22C55E]/20 to-[#16A34A]/10 border-2 border-[#22C55E] rounded-2xl p-6 md:p-8 text-center">
          <p className="text-[#D4C4A8] text-lg mb-3">Nessa oferta, você paga UMA ÚNICA VEZ</p>
          <p className="text-6xl md:text-8xl font-bold text-[#22C55E] mb-4">R$ 697</p>
          <p className="text-xl md:text-2xl text-white mb-6">e leva PRA SEMPRE</p>
          <div className="bg-[#1F1B16] rounded-2xl p-6 inline-block">
            <p className="text-sm text-[#D4C4A8] uppercase tracking-wider mb-2">Economia projetada em 5 anos</p>
            <p className="text-3xl md:text-5xl font-bold text-[#22C55E]">R$ 9.698</p>
            <p className="text-lg text-[#22C55E] mt-1">(93% off)</p>
          </div>
        </div>
        <p className="text-center text-[#D4C4A8] mt-8 text-sm md:text-base italic">
          E olha que esse cálculo é CONSERVADOR. Vitalício não tem prazo. Pode ser 5, 10, 20 anos. O que você paga agora vale pra sempre.
        </p>
      </div>
    </section>
  );
}

// =================== DOBRA 9 — PREÇO + BOTÃO ===================
function Dobra9PrecoBotao() {
  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-[#B3541E] to-[#A8261E] text-white">
      <div className="container mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full mb-6 animate-pulse">
          <Zap size={14} className="text-[#A8261E]" />
          <span className="text-xs md:text-sm font-bold text-[#A8261E] uppercase tracking-wider">🔥 OFERTA EXCLUSIVA AO VIVO · VAGAS LIMITADAS</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold mb-8">SEU INVESTIMENTO</h2>
        <div className="bg-white text-[#3D3D3D] rounded-3xl p-8 md:p-12 shadow-2xl">
          <p className="text-2xl md:text-3xl line-through text-[#5C4033]/60 mb-2">De R$ 2.079</p>
          <p className="text-[#5C4033] uppercase tracking-wider text-sm mb-2">Por apenas</p>
          <p className="text-6xl md:text-8xl font-bold text-[#B3541E] mb-2">R$ 697</p>
          <p className="text-lg md:text-xl text-[#3D3D3D] mb-2">à vista</p>
          <p className="text-base md:text-lg text-[#5C4033] mb-8">ou <span className="font-bold">12x R$ 72,09</span> no cartão</p>
          <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
            {[
              'Acesso imediato após pagamento',
              'Vitalício pra todos os 7 cursos',
              'Plataforma Hotmart oficial',
              'Garantia de 7 dias (Hotmart)',
            ].map((d, i) => (
              <li key={i} className="flex items-center gap-3 text-[#3D3D3D]">
                <Check className="shrink-0 text-[#22C55E]" size={20} />
                <span>{d}</span>
              </li>
            ))}
          </ul>
          <Btn large>QUERO A COLEÇÃO COMPLETA POR 12x DE R$ 72,09</Btn>
          <p className="text-sm text-[#5C4033] mt-4 flex items-center justify-center gap-2">
            <Lock size={14} /> Pagamento seguro via Hotmart
          </p>
        </div>
      </div>
    </section>
  );
}

// =================== DOBRA 10 — PREÇO DE FICAR PARADO ===================
function Dobra10PrecoFicarParado() {
  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-[#FDF9F3] to-[#F5EFE6]">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#A8261E]/10 border border-[#A8261E]/30 rounded-full mb-4">
            <AlertTriangle size={14} className="text-[#A8261E]" />
            <span className="text-xs md:text-sm font-bold text-[#A8261E] uppercase tracking-wider">O preço de NÃO levar</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-[#3D3D3D]">
            Quanto vai te custar <span className="text-[#A8261E]">NÃO</span> levar esse combo?
          </h2>
        </div>
        <div className="space-y-5 text-lg leading-relaxed text-[#3D3D3D]">
          <p>Você sai dessa live. Tudo bem.</p>
          <p>Daqui <span className="font-bold">3 meses</span>, quando aparecer aquela noiva pedindo um terço bordado pra padrinhos, você não vai ter o curso pra atender.</p>
          <p>Daqui <span className="font-bold">6 meses</span>, quando você quiser sair da peça de R$ 100 pra coleção de R$ 2.000, vai precisar aprender posicionamento. E aí já vai ser R$ 297 só pra começar.</p>
          <p>Daqui <span className="font-bold">1 ano</span>, quando você ver outra artesã do seu bairro vendendo R$ 50 mil/mês, vai voltar aqui. Mas o preço de R$ 697 não vai mais existir.</p>
        </div>
        <div className="mt-10 bg-gradient-to-br from-[#1F1B16] to-[#2C2620] text-white rounded-2xl p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[#22C55E] font-bold text-2xl md:text-3xl">R$ 697</p>
              <p className="text-[#D4C4A8] text-sm mt-2">hoje, vitalício, sem renovar nunca mais</p>
            </div>
            <div>
              <p className="text-[#A8261E] font-bold text-2xl md:text-3xl">R$ 10.395</p>
              <p className="text-[#D4C4A8] text-sm mt-2">avulso renovando 5 anos</p>
            </div>
            <div>
              <p className="text-[#A8261E] font-bold text-2xl md:text-3xl">Travada</p>
              <p className="text-[#D4C4A8] text-sm mt-2">continuar onde você está</p>
            </div>
          </div>
          <p className="text-center mt-6 text-[#C5A059] font-bold text-lg italic">Você decide.</p>
        </div>
      </div>
    </section>
  );
}

// =================== DOBRA 11 — AUTORIDADE ===================
function Dobra11Autoridade() {
  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-[#F5EFE6] to-[#EBE5D9]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Eyebrow>Quem é a Rita Machado</Eyebrow>
          <h2 className="text-3xl md:text-5xl font-bold text-[#3D3D3D]">
            12 anos de ateliê. <span className="text-[#B3541E]">Centenas de alunas</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative order-2 md:order-1">
            <div className="absolute -inset-3 bg-gradient-to-br from-[#C5A059]/30 to-[#B3541E]/30 rounded-3xl blur-xl" />
            <img
              src="/img/rita/rita-03.jpg"
              alt="Rita Machado pintando peça sacra"
              className="relative rounded-3xl shadow-2xl w-full border-4 border-[#C5A059]/40"
              loading="lazy"
            />
          </div>
          <div className="bg-white border-2 border-[#E8DFD0] rounded-3xl p-6 md:p-8 shadow-md space-y-4 text-base md:text-lg text-[#3D3D3D] leading-relaxed order-1 md:order-2">
            <p><span className="font-bold text-[#B3541E]">12 anos de ateliê.</span> Saí do banco em 2014. Hoje sou a maior referência brasileira em artesanato sacro católico.</p>
            <p><span className="font-bold text-[#B3541E]">Centenas de alunas</span> formadas pelo método, do Brasil e do exterior.</p>
            <p>Marca registrada de <span className="font-bold">Customização e Terços</span>, autora dos cursos vendidos no Brasil inteiro.</p>
            <p>Construí meu método na prática, atendendo noivas, vendendo coleções, escalando ateliê do zero pra equipe própria.</p>
            <p className="italic font-serif text-lg md:text-xl text-[#5C4033] border-l-4 border-[#C5A059] pl-6">
              Não ensino teoria. Ensino o caminho que ME tirou do CLT e me colocou aqui, falando com você por uma tela.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4 mt-8 max-w-3xl mx-auto">
          {['/img/rita/rita-02.jpg', '/img/rita/rita-04.jpg', '/img/rita/rita-05.jpg'].map((src, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-md">
              <img src={src} alt={`Rita ${i + 2}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================== DOBRA 12 — CTA FINAL / REPETIR PREÇO ===================
function Dobra12CTAFinal() {
  return (
    <section className="py-20 md:py-32 px-4 bg-gradient-to-br from-[#1F1B16] via-[#2C2620] to-[#3D3D3D] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,38,30,0.15),transparent_50%)]" />
      <div className="container mx-auto max-w-3xl relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#A8261E] rounded-full mb-6 animate-pulse">
          <Clock size={14} className="text-white" />
          <span className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">🚨 ÚLTIMA CHANCE · VAGAS LIMITADAS</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="text-[#C5A059]">7 cursos vitalícios.</span>
          <br />Domínio completo do nicho.
          <br /><span className="text-[#22C55E]">Pra sempre.</span>
        </h2>
        <div className="bg-[#3D3D3D]/50 backdrop-blur rounded-2xl p-6 md:p-8 mb-8">
          <p className="text-[#D4C4A8] mb-4">Avulso renovando 5 anos: <span className="text-[#A8261E] font-bold">R$ 10.395</span></p>
          <p className="text-[#D4C4A8] mb-6">Vitalício, UMA ÚNICA VEZ:</p>
          <p className="text-6xl md:text-8xl font-bold text-[#22C55E] mb-2">R$ 697</p>
          <p className="text-lg md:text-xl text-white">à vista <span className="text-[#D4C4A8]">ou</span> 12x R$ 72,09</p>
        </div>
        <Btn large>QUERO A COLEÇÃO COMPLETA POR 12x DE R$ 72,09</Btn>
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-[#D4C4A8]">
          <span className="flex items-center gap-1"><Lock size={14} /> Pagamento seguro Hotmart</span>
          <span className="flex items-center gap-1"><Check size={14} /> Acesso imediato</span>
          <span className="flex items-center gap-1"><Shield size={14} /> 7 dias garantia</span>
        </div>
        <p className="text-sm text-[#D4C4A8] mt-8 italic max-w-xl mx-auto">
          Essa oferta encerra quando a live acabar OU quando as vagas esgotarem. Depois disso, cada curso volta a R$ 297 e o combo deixa de existir.
        </p>
      </div>
    </section>
  );
}

// =================== APP ===================
function App() {
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    CTX_SET_OPEN = setModalOpen;
    return () => { CTX_SET_OPEN = null; };
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF9F3] text-[#3D3D3D] selection:bg-[#C5A059] selection:text-white">
      <CheckoutFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <TopBanner />
      <Dobra1Promessa />
      <Dobra6TudoQueRecebe />
      <Dobra2ProvaSocial />
      <GaleriaPecas />
      <Dobra3ApertarPedra />
      <Dobra4Transicao />
      <Dobra5PassoAPasso />
      <BannerDepoimentosTransformacao />
      <Dobra7ParaQuemServe />
      <Dobra8Ancoragem />
      <Dobra9PrecoBotao />
      <BannerDepoimentosLealdade />
      <Dobra10PrecoFicarParado />
      <Dobra11Autoridade />
      <Dobra12CTAFinal />
      <footer className="bg-[#1F1B16] text-[#D4C4A8] py-8 text-center text-sm border-t border-[#3D3D3D]">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Rita Machado · Customização e Terços. Todos os direitos reservados.</p>
          <p className="mt-2 opacity-60 italic font-serif">Fé, Arte e Propósito.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
