/**
 * script.js — +300 Brincadeiras Bíblicas para Crianças
 * Landing Page — Funcionalidades Interativas
 * -----------------------------------------------
 * 1. Animações de fade-in ao scroll (IntersectionObserver)
 * 2. Order bumps com atualização dinâmica de preço
 * 3. Botão fixo (sticky CTA) ao rolar a página
 * 4. Links de checkout por combinação de produtos
 * 5. Popup de upsell para o pacote completo
 */

// ─── CONSTANTES ────────────────────────────────────────
const BASE_PRICE = 19.90;

// ─── LINKS DE CHECKOUT ─────────────────────────────────
// Chave: combinação de bumps selecionados (ordenados), separados por "+"
// Sem extras = "none"
const CHECKOUT_LINKS = {
  'none':          'https://pay.kiwify.com.br/l3OGnkq', // Só principal
  'bump1':         'https://pay.kiwify.com.br/gZhTlJE', // + Culto Infantil
  'bump2':         'https://pay.kiwify.com.br/FpCxXEk', // + Histórias Ilustradas
  'bump3':         'https://pay.kiwify.com.br/r4p1krl', // + Pregações Infantis
  'bump1+bump2':   'https://pay.kiwify.com.br/NgMbC7n', // + Culto + Histórias
  'bump1+bump3':   'https://pay.kiwify.com.br/0p41bc4', // + Culto + Pregações
  'bump2+bump3':   'https://pay.kiwify.com.br/35Et2Y1', // + Histórias + Pregações
  'bump1+bump2+bump3': 'https://pay.kiwify.com.br/2Y5yT4G', // Pacote Completo
};

// Link do pacote completo em promoção (exibido no popup de upsell)
const UPSELL_PROMO_LINK = 'https://pay.kiwify.com.br/6RUU1fG';

// ─── ESTADO DA APLICAÇÃO ───────────────────────────────
let selectedExtras = {}; // { bumpId: price }
let pendingCheckoutUrl = ''; // URL que o usuário iria sem o upsell

// ─── DOM READY ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initFadeInAnimations();
  initOrderBumps();
  initStickyBar();
  initBuyButton();
  initUpsellPopup();
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
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
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

function handleBumpChange(event) {
  const checkbox  = event.target;
  const bumpId    = checkbox.dataset.id;
  const price     = parseFloat(checkbox.dataset.price);
  const bumpLabel = checkbox.closest('.bump');

  if (checkbox.checked) {
    selectedExtras[bumpId] = price;
    bumpLabel.classList.add('selected');
  } else {
    delete selectedExtras[bumpId];
    bumpLabel.classList.remove('selected');
  }

  updatePriceDisplay();
}

function updatePriceDisplay() {
  const extrasTotal = Object.values(selectedExtras).reduce((sum, val) => sum + val, 0);
  const grandTotal  = BASE_PRICE + extrasTotal;
  const formatBRL   = (v) => v.toFixed(2).replace('.', ',');

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

  animatePriceChange(totalValue);
}

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
// 3. STICKY CTA
// ─────────────────────────────────────────────────────────
function initStickyBar() {
  const stickyCta   = document.getElementById('stickyCta');
  const heroSection = document.getElementById('hero');
  if (!stickyCta || !heroSection) return;

  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        stickyCta.classList.toggle('visible', !entry.isIntersecting);
      });
    },
    { threshold: 0.05 }
  );
  heroObserver.observe(heroSection);

  const orderSection = document.getElementById('order');
  if (orderSection) {
    const orderObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) stickyCta.classList.remove('visible');
        });
      },
      { threshold: 0.2 }
    );
    orderObserver.observe(orderSection);
  }
}

// ─────────────────────────────────────────────────────────
// 4. LINK DE CHECKOUT — resolve a URL correta pelo pedido
// ─────────────────────────────────────────────────────────

/**
 * Monta a chave de lookup a partir dos bumps selecionados.
 * Ex: bump1 + bump3 → "bump1+bump3"
 */
function getCheckoutKey() {
  const keys = Object.keys(selectedExtras).sort();
  return keys.length === 0 ? 'none' : keys.join('+');
}

/**
 * Retorna a URL de checkout para a seleção atual.
 */
function getCheckoutUrl() {
  const key = getCheckoutKey();
  return CHECKOUT_LINKS[key] || CHECKOUT_LINKS['none'];
}

// ─────────────────────────────────────────────────────────
// 5. BOTÃO DE COMPRA — abre popup de upsell antes de redirecionar
// ─────────────────────────────────────────────────────────
function initBuyButton() {
  const buyBtn = document.getElementById('buyBtn');
  if (!buyBtn) return;
  buyBtn.addEventListener('click', handlePurchase);
}

function handlePurchase() {
  const key = getCheckoutKey();

  // Se já é o pacote completo, vai direto sem popup
  if (key === 'bump1+bump2+bump3') {
    window.location.href = CHECKOUT_LINKS['bump1+bump2+bump3'];
    return;
  }

  // Salva a URL destino e exibe o popup de upsell
  pendingCheckoutUrl = getCheckoutUrl();
  showUpsellPopup();
}

// ─────────────────────────────────────────────────────────
// 6. POPUP DE UPSELL
// ─────────────────────────────────────────────────────────
function initUpsellPopup() {
  // Botão "Sim, quero a promoção"
  document.getElementById('upsellAccept').addEventListener('click', () => {
    closeUpsellPopup();
    window.location.href = UPSELL_PROMO_LINK;
  });

  // Botão "Não, quero continuar com meu pedido"
  document.getElementById('upsellDecline').addEventListener('click', () => {
    closeUpsellPopup();
    window.location.href = pendingCheckoutUrl;
  });

  // Fechar clicando no overlay
  document.getElementById('upsellOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      closeUpsellPopup();
      window.location.href = pendingCheckoutUrl;
    }
  });
}

function showUpsellPopup() {
  const overlay = document.getElementById('upsellOverlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeUpsellPopup() {
  const overlay = document.getElementById('upsellOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ─────────────────────────────────────────────────────────
// 7. SCROLL SUAVE PARA ÂNCORAS INTERNAS
// ─────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
