/**
 * script.js — +300 Brincadeiras Bíblicas para Crianças
 * Landing Page — Funcionalidades Interativas
 * -----------------------------------------------
 * 1. Animações de fade-in ao scroll (IntersectionObserver)
 * 2. Order bumps com atualização dinâmica de preço
 * 3. Botão fixo (sticky CTA) ao rolar a página
 * 4. Simulação de compra ao clicar no botão principal
 */

// ─── CONSTANTES ────────────────────────────────────────
const BASE_PRICE = 19.90; // Preço base do produto principal (R$)

// ─── ESTADO DA APLICAÇÃO ───────────────────────────────
let selectedExtras = {}; // { bumpId: price }

// ─── DOM READY ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initFadeInAnimations();
  initOrderBumps();
  initStickyBar();
  initBuyButton();
});

// ─────────────────────────────────────────────────────────
// 1. ANIMAÇÕES DE FADE-IN AO SCROLL
// ─────────────────────────────────────────────────────────
function initFadeInAnimations() {
  const elements = document.querySelectorAll('.fade-in');

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Para de observar após a animação (otimização de performance)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,        // Ativa quando 12% do elemento está visível
      rootMargin: '0px 0px -40px 0px' // Ligeiro offset para suavidade
    }
  );

  elements.forEach((el) => observer.observe(el));
}

// ─────────────────────────────────────────────────────────
// 2. ORDER BUMPS — SELEÇÃO E ATUALIZAÇÃO DE PREÇO
// ─────────────────────────────────────────────────────────
function initOrderBumps() {
  const checkboxes = document.querySelectorAll('.bump__check');

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', handleBumpChange);
  });
}

/**
 * Chamado quando um checkbox de order bump é alterado.
 * Atualiza o estado, o visual e o totalizador de preço.
 */
function handleBumpChange(event) {
  const checkbox = event.target;
  const bumpId    = checkbox.dataset.id;
  const price     = parseFloat(checkbox.dataset.price);
  const bumpLabel = checkbox.closest('.bump');

  if (checkbox.checked) {
    // Adiciona o extra ao estado
    selectedExtras[bumpId] = price;
    bumpLabel.classList.add('selected');
  } else {
    // Remove o extra do estado
    delete selectedExtras[bumpId];
    bumpLabel.classList.remove('selected');
  }

  updatePriceDisplay();
}

/**
 * Recalcula o total e atualiza todos os elementos de preço na página.
 */
function updatePriceDisplay() {
  const extrasTotal = Object.values(selectedExtras).reduce((sum, val) => sum + val, 0);
  const grandTotal  = BASE_PRICE + extrasTotal;

  // Formata para moeda BR
  const formatBRL = (value) =>
    value.toFixed(2).replace('.', ',');

  // Atualiza o totalizador
  const extrasRow   = document.getElementById('extrasRow');
  const extrasValue = document.getElementById('extrasValue');
  const totalValue  = document.getElementById('totalValue');
  const ctaPrice    = document.getElementById('ctaPrice');
  const stickyPrice = document.getElementById('stickyPrice');

  if (extrasTotal > 0) {
    extrasRow.style.display = 'flex';
    extrasValue.textContent = `R$ ${formatBRL(extrasTotal)}`;
  } else {
    extrasRow.style.display = 'none';
  }

  totalValue.textContent  = `R$ ${formatBRL(grandTotal)}`;
  ctaPrice.textContent    = formatBRL(grandTotal);
  stickyPrice.textContent = formatBRL(grandTotal);

  // Animação sutil no total ao mudar
  animatePriceChange(totalValue);
}

/**
 * Aplica animação de "pop" no elemento de preço alterado.
 */
function animatePriceChange(element) {
  element.style.transition = 'transform 0.18s ease, color 0.18s ease';
  element.style.transform  = 'scale(1.18)';
  element.style.color      = 'var(--color-green)';

  setTimeout(() => {
    element.style.transform = 'scale(1)';
    element.style.color     = '';
  }, 220);
}

// ─────────────────────────────────────────────────────────
// 3. STICKY CTA — EXIBE A BARRA FIXA AO ROLAR
// ─────────────────────────────────────────────────────────
function initStickyBar() {
  const stickyCta = document.getElementById('stickyCta');
  const heroSection = document.getElementById('hero');

  if (!stickyCta || !heroSection) return;

  // Mostra o sticky após o usuário sair do hero
  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          stickyCta.classList.add('visible');
        } else {
          stickyCta.classList.remove('visible');
        }
      });
    },
    { threshold: 0.05 }
  );

  heroObserver.observe(heroSection);

  // Garante que o sticky não cobre a seção de pedido
  const orderSection = document.getElementById('order');
  if (orderSection) {
    const orderObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stickyCta.classList.remove('visible');
          }
        });
      },
      { threshold: 0.2 }
    );
    orderObserver.observe(orderSection);
  }
}

// ─────────────────────────────────────────────────────────
// 4. BOTÃO DE COMPRA — SIMULAÇÃO
// ─────────────────────────────────────────────────────────
function initBuyButton() {
  const buyBtn = document.getElementById('buyBtn');
  if (!buyBtn) return;

  buyBtn.addEventListener('click', handlePurchase);
}

/**
 * Simula o fluxo de compra:
 * - Monta um resumo do pedido com os itens selecionados
 * - Exibe um alert amigável confirmando a simulação
 * - Em produção, aqui seria disparada a integração com o gateway de pagamento
 */
function handlePurchase() {
  const extrasTotal = Object.values(selectedExtras).reduce((sum, val) => sum + val, 0);
  const grandTotal  = BASE_PRICE + extrasTotal;
  const formatBRL   = (v) => v.toFixed(2).replace('.', ',');

  // Monta lista dos extras selecionados
  const extrasLabels = {
    bump1: 'Dinâmicas para Culto Infantil (+R$ 17,00)',
    bump2: 'Histórias Bíblicas Ilustradas (+R$ 19,00)',
    bump3: 'Atividades para Datas Especiais Cristãs (+R$ 15,00)',
  };

  let extrasList = '';
  Object.keys(selectedExtras).forEach((id) => {
    extrasList += `\n   ✅ ${extrasLabels[id] || id}`;
  });
  if (!extrasList) extrasList = '\n   (nenhum extra selecionado)';

  // Mensagem de simulação
  const message = [
    '🎉 Pedido confirmado! (Simulação)',
    '',
    '📦 Seu pedido:',
    '   ✅ +300 Brincadeiras Bíblicas — R$ 19,90',
    extrasList,
    '',
    `💰 Total: R$ ${formatBRL(grandTotal)}`,
    '',
    '🚀 Em produção, você seria redirecionado ao',
    '   gateway de pagamento agora.',
    '',
    'Obrigado por testar a landing page! 💛',
  ].join('\n');

  alert(message);

  // Log para debugging / integração futura
  console.group('📦 Simulação de Compra');
  console.log('Produto principal: +300 Brincadeiras Bíblicas — R$', formatBRL(BASE_PRICE));
  if (Object.keys(selectedExtras).length > 0) {
    console.log('Extras selecionados:', selectedExtras);
  }
  console.log('Total do pedido: R$', formatBRL(grandTotal));
  console.groupEnd();
}

// ─────────────────────────────────────────────────────────
// 5. SCROLL SUAVE PARA ÂNCORAS INTERNAS
// ─────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    const target   = document.querySelector(targetId);

    if (target) {
      e.preventDefault();
      const offset = 16; // margem superior ao rolar
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
