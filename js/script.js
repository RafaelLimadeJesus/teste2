/* Fallback visual para imagens que não carregarem */
document.querySelectorAll("img").forEach(function (image) {
  image.addEventListener("error", function () {
    image.parentElement.classList.add("image-fallback");
    image.hidden = true;
  });
});

/* Navegação mobile */
const menuButton = document.querySelector(".toggle");
const nav = document.querySelector(".links");

if (menuButton && nav) {
  menuButton.addEventListener("click", function () {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    menuButton.setAttribute("aria-label", open ? "Abrir menu" : "Fechar menu");
    menuButton.textContent = open ? "☰" : "×";
    nav.classList.toggle("open", !open);
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Abrir menu");
      menuButton.textContent = "☰";
    });
  });
}

/* Formulário: prepara o pedido para envio pelo WhatsApp */
const reservationForm = document.getElementById("reservation-form");

if (reservationForm) {
  const reservationDate = document.getElementById("res-date");
  const localToday = new Date();
  const todayValue = [
    localToday.getFullYear(),
    String(localToday.getMonth() + 1).padStart(2, "0"),
    String(localToday.getDate()).padStart(2, "0"),
  ].join("-");

  reservationDate.min = todayValue;

  reservationForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!reservationForm.reportValidity()) return;

    const formData = new FormData(reservationForm);
    const [year, month, day] = String(formData.get("date")).split("-");
    const parts = [
      "Olá! Gostaria de solicitar uma reserva no Vila Prime Restaurante.",
      "",
      "Nome: " + String(formData.get("name")).trim(),
      "Telefone: " + String(formData.get("phone")).trim(),
      "Data: " + [day, month, year].join("/"),
      "Pessoas: " + String(formData.get("guests")),
      "Refeição: " + String(formData.get("meal")),
      "Horário de preferência: " +
        (String(formData.get("time") || "").trim() || "flexível"),
      "Observações: " +
        (String(formData.get("notes") || "").trim() || "Nenhuma"),
      "",
      "Poderiam confirmar a disponibilidade, por favor?",
    ];
    const message = encodeURIComponent(parts.join("\n"));
    const whatsappNumber = "5511991735016";
    const whatsappUrl = "https://wa.me/" + whatsappNumber + "?text=" + message;
    const status = document.getElementById("reservation-status");

    if (status) {
      status.textContent =
        "Abrindo o WhatsApp com seu pedido de reserva preenchido.";
    }

    const opened = window.open(whatsappUrl, "_blank");
    if (opened) {
      opened.opener = null;
    } else {
      window.location.href = whatsappUrl;
    }
  });
}

/* Abas do cardápio */
const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

tabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    tabs.forEach(function (item) {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      document.getElementById(item.getAttribute("aria-controls")).hidden =
        !active;
    });
  });

  tab.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();
    const index = tabs.indexOf(tab);
    const offset = event.key === "ArrowRight" ? 1 : tabs.length - 1;
    const nextTab = tabs[(index + offset) % tabs.length];
    nextTab.focus();
    nextTab.click();
  });
});

/* Carrossel de ofertas: setas, rotação automática e gesto de arrastar */
(function initPromoCarousel(scope) {
  const carousel = scope.querySelector("[data-promo-carousel]");
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll("[data-promo-slide]"));
  const dots = Array.from(carousel.querySelectorAll("[data-promo-index]"));
  const previous = carousel.querySelector("[data-promo-prev]");
  const next = carousel.querySelector("[data-promo-next]");
  const toggle = carousel.querySelector("[data-promo-toggle]");
  const controls = carousel.querySelector(".promo-controls");
  const status = carousel.querySelector("[data-promo-status]");
  const swipeArea = carousel.querySelector(".promo-slides");

  if (
    slides.length < 2 ||
    !previous ||
    !next ||
    !toggle ||
    !controls ||
    !swipeArea
  ) {
    return;
  }

  const motionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

  let active = 0;
  let timer = null;
  let userPaused = false;
  let hovering = false;
  let focused = false;
  let swipeStart = null;

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function isReduced() {
    return Boolean(motionQuery && motionQuery.matches);
  }

  function updateToggle() {
    const reduced = isReduced();
    toggle.disabled = reduced;
    toggle.setAttribute(
      "aria-pressed",
      String(userPaused || reduced),
    );
    toggle.setAttribute(
      "aria-label",
      reduced
        ? "Rotação automática desativada pela preferência de movimento reduzido"
        : userPaused
          ? "Ativar rotação automática"
          : "Pausar rotação automática",
    );
    toggle.textContent = userPaused || reduced ? "▶" : "Ⅱ";
  }

  function syncTimer() {
    stop();
    updateToggle();

    if (userPaused || hovering || focused || document.hidden || isReduced()) {
      return;
    }

    timer = window.setInterval(function () {
      show(active + 1, false);
    }, 5600);
  }

  function show(index, announce) {
    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      const selected = slideIndex === active;
      slide.classList.toggle("is-active", selected);
      slide.setAttribute("aria-hidden", String(!selected));
      slide.inert = !selected;
    });

    dots.forEach(function (dot, dotIndex) {
      const selected = dotIndex === active;
      dot.classList.toggle("is-active", selected);

      if (selected) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    if (announce && status) {
      const label = slides[active]
        .getAttribute("aria-label")
        .replace(/^\d+ de \d+:\s*/, "");
      status.textContent = "Oferta " + (active + 1) + " de " + slides.length + ". " + label;
    }

    syncTimer();
  }

  function onPrevious() {
    show(active - 1, true);
  }

  function onNext() {
    show(active + 1, true);
  }

  function onPointerDown(event) {
    if (event.pointerType === "mouse" || !event.isPrimary) return;

    swipeStart = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
    stop();
  }

  function onPointerUp(event) {
    if (!swipeStart || event.pointerId !== swipeStart.pointerId) return;

    const start = swipeStart;
    swipeStart = null;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (Math.abs(deltaX) > 38 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
      if (deltaX < 0) {
        onNext();
      } else {
        onPrevious();
      }
      return;
    }

    syncTimer();
  }

  function onPointerCancel(event) {
    if (!swipeStart || event.pointerId !== swipeStart.pointerId) return;
    swipeStart = null;
    syncTimer();
  }

  function onToggle() {
    if (!isReduced()) {
      userPaused = !userPaused;
      syncTimer();
    }
  }

  function onEnter() {
    hovering = true;
    syncTimer();
  }

  function onLeave() {
    hovering = false;
    syncTimer();
  }

  function onFocusIn() {
    focused = true;
    syncTimer();
  }

  function onFocusOut(event) {
    if (!carousel.contains(event.relatedTarget)) {
      focused = false;
      syncTimer();
    }
  }

  function onVisibility() {
    syncTimer();
  }

  function onMotionChange() {
    syncTimer();
  }

  function onDot(event) {
    show(Number(event.currentTarget.getAttribute("data-promo-index")), true);
  }

  function onPageHide() {
    stop();
    previous.removeEventListener("click", onPrevious);
    next.removeEventListener("click", onNext);
    toggle.removeEventListener("click", onToggle);
    swipeArea.removeEventListener("pointerdown", onPointerDown);
    swipeArea.removeEventListener("pointerup", onPointerUp);
    swipeArea.removeEventListener("pointercancel", onPointerCancel);
    dots.forEach(function (dot) {
      dot.removeEventListener("click", onDot);
    });
    carousel.removeEventListener("mouseenter", onEnter);
    carousel.removeEventListener("mouseleave", onLeave);
    carousel.removeEventListener("focusin", onFocusIn);
    carousel.removeEventListener("focusout", onFocusOut);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", onPageHide);

    if (motionQuery) {
      if (typeof motionQuery.removeEventListener === "function") {
        motionQuery.removeEventListener("change", onMotionChange);
      } else if (typeof motionQuery.removeListener === "function") {
        motionQuery.removeListener(onMotionChange);
      }
    }
  }

  previous.addEventListener("click", onPrevious);
  next.addEventListener("click", onNext);
  toggle.addEventListener("click", onToggle);
  swipeArea.addEventListener("pointerdown", onPointerDown);
  swipeArea.addEventListener("pointerup", onPointerUp);
  swipeArea.addEventListener("pointercancel", onPointerCancel);
  dots.forEach(function (dot) {
    dot.addEventListener("click", onDot);
  });
  carousel.addEventListener("mouseenter", onEnter);
  carousel.addEventListener("mouseleave", onLeave);
  carousel.addEventListener("focusin", onFocusIn);
  carousel.addEventListener("focusout", onFocusOut);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onPageHide, { once: true });

  if (motionQuery) {
    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", onMotionChange);
    } else if (typeof motionQuery.addListener === "function") {
      motionQuery.addListener(onMotionChange);
    }
  }

  controls.hidden = false;
  carousel.classList.add("is-ready");
  syncTimer();
})(document);

/* Animações ao rolar com suporte a movimento reduzido */
(function initScrollReveal() {
  const items = Array.from(document.querySelectorAll(".reveal"));
  if (!items.length) return;

  let observer = null;
  let motionQuery = null;
  let motionHandler = null;
  let pageHideHandler = null;

  function reveal(item) {
    item.classList.remove("reveal-pending");
    item.classList.add("show");

    if (observer) {
      observer.unobserve(item);
    }
  }

  function revealAll() {
    items.forEach(function (item) {
      item.classList.remove("reveal-pending");
      item.classList.add("show");
    });

    if (observer) {
      observer.disconnect();
    }
  }

  function onFocusIn(event) {
    const target = event.target;
    if (!target || typeof target.closest !== "function") return;

    const item = target.closest(".reveal.reveal-pending");
    if (item) reveal(item);
  }

  function cleanup() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    document.removeEventListener("focusin", onFocusIn);

    if (motionQuery && motionHandler) {
      if (typeof motionQuery.removeEventListener === "function") {
        motionQuery.removeEventListener("change", motionHandler);
      } else if (typeof motionQuery.removeListener === "function") {
        motionQuery.removeListener(motionHandler);
      }
    }

    if (pageHideHandler) {
      window.removeEventListener("pagehide", pageHideHandler);
    }
  }

  function onMotionChange(event) {
    if (event.matches) {
      revealAll();
      cleanup();
    }
  }

  function onPageHide() {
    revealAll();
    cleanup();
  }

  try {
    motionQuery = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;

    if (
      (motionQuery && motionQuery.matches) ||
      !("IntersectionObserver" in window)
    ) {
      revealAll();
      return;
    }

    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    items.forEach(function (item) {
      item.classList.add("reveal-pending");
      observer.observe(item);
    });

    document.addEventListener("focusin", onFocusIn);

    if (motionQuery) {
      motionHandler = onMotionChange;

      if (typeof motionQuery.addEventListener === "function") {
        motionQuery.addEventListener("change", motionHandler);
      } else if (typeof motionQuery.addListener === "function") {
        motionQuery.addListener(motionHandler);
      }
    }

    pageHideHandler = onPageHide;
    window.addEventListener("pagehide", pageHideHandler, { once: true });
  } catch (error) {
    revealAll();
    cleanup();
  }
})();

/* Sacola local de ofertas: a equipe confirma disponibilidade pelo WhatsApp */
(function initOfferBag() {
  const addButtons = Array.from(document.querySelectorAll("[data-add-to-bag]"));
  const openButtons = Array.from(document.querySelectorAll("[data-bag-open]"));
  const bagDialog = document.getElementById("bag-dialog");
  const closeButton = bagDialog && bagDialog.querySelector("[data-bag-close]");
  const itemsList = bagDialog && bagDialog.querySelector("[data-bag-items]");
  const emptyMessage = bagDialog && bagDialog.querySelector("[data-bag-empty]");
  const whatsappLink = bagDialog && bagDialog.querySelector("[data-bag-whatsapp]");
  const countNodes = Array.from(document.querySelectorAll("[data-bag-count]"));
  const status = document.querySelector("[data-bag-status]");

  if (!addButtons.length || !bagDialog || !closeButton || !itemsList) return;

  const storageKey = "vila-prime-offers-bag-v1";
  const whatsappNumber = "5511991735016";
  const offers = new Map(
    addButtons.map(function (button) {
      return [button.dataset.offerId, {
        id: button.dataset.offerId,
        name: button.dataset.offerName,
        price: button.dataset.offerPrice,
      }];
    }),
  );
  let selectedIds = readBag();
  let lastTrigger = null;

  function readBag() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      return Array.isArray(stored)
        ? stored.filter(function (id) { return offers.has(id); })
        : [];
    } catch (error) {
      return [];
    }
  }

  function saveBag() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(selectedIds));
    } catch (error) {
      /* A sessão continua funcionando se o navegador bloquear o armazenamento. */
    }
  }

  function updateWhatsAppLink() {
    if (!whatsappLink) return;
    if (!selectedIds.length) {
      whatsappLink.hidden = true;
      whatsappLink.removeAttribute("href");
      return;
    }

    const lines = [
      "Olá! Tenho interesse nestas ofertas do Vila Prime:",
      ...selectedIds.map(function (id) {
        const offer = offers.get(id);
        return "• " + offer.name + " — " + offer.price;
      }),
      "",
      "Poderiam confirmar disponibilidade, horários e condições?",
    ];
    whatsappLink.href = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(lines.join("\n"));
    whatsappLink.hidden = false;
  }

  function renderBag() {
    selectedIds = selectedIds.filter(function (id, index, values) {
      return offers.has(id) && values.indexOf(id) === index;
    });
    saveBag();
    countNodes.forEach(function (node) {
      node.textContent = String(selectedIds.length);
    });
    addButtons.forEach(function (button) {
      const added = selectedIds.includes(button.dataset.offerId);
      button.disabled = added;
      button.textContent = added ? "Na sacola" : "Adicionar à sacola";
    });

    itemsList.replaceChildren();
    selectedIds.forEach(function (id) {
      const offer = offers.get(id);
      const item = document.createElement("li");
      item.className = "bag-item";
      const details = document.createElement("div");
      const name = document.createElement("h3");
      const price = document.createElement("p");
      const remove = document.createElement("button");

      name.textContent = offer.name;
      price.textContent = offer.price + " · valor informado na oferta";
      remove.className = "bag-remove";
      remove.type = "button";
      remove.textContent = "Remover";
      remove.setAttribute("aria-label", "Remover " + offer.name + " da sacola");
      remove.addEventListener("click", function () {
        selectedIds = selectedIds.filter(function (selectedId) { return selectedId !== id; });
        renderBag();
        if (status) status.textContent = offer.name + " removido da sacola.";
        document.getElementById("bag-title").focus();
      });

      details.append(name, price);
      item.append(details, remove);
      itemsList.append(item);
    });

    if (emptyMessage) emptyMessage.hidden = selectedIds.length > 0;
    updateWhatsAppLink();
  }

  addButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const id = button.dataset.offerId;
      if (!offers.has(id) || selectedIds.includes(id)) return;
      selectedIds.push(id);
      renderBag();
      if (status) status.textContent = offers.get(id).name + " adicionada à sacola.";
    });
  });

  openButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      lastTrigger = button;
      bagDialog.showModal();
      button.setAttribute("aria-expanded", "true");
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", function () {
    bagDialog.close();
  });
  bagDialog.addEventListener("click", function (event) {
    if (event.target === bagDialog) bagDialog.close();
  });
  bagDialog.addEventListener("close", function () {
    openButtons.forEach(function (button) {
      button.setAttribute("aria-expanded", "false");
    });
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  });

  renderBag();
})();
/* Visualização ampliada e acessível das fotos do site */
(function initPhotoLightbox() {
  const photos = Array.from(document.querySelectorAll("img")).filter(function (photo) {
    return !photo.closest(".logo-mark");
  });

  if (!photos.length || typeof HTMLDialogElement === "undefined") return;

  const dialog = document.createElement("dialog");
  dialog.className = "photo-lightbox";
  dialog.setAttribute("aria-label", "Foto ampliada");

  const closeButton = document.createElement("button");
  closeButton.className = "photo-lightbox__close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Fechar foto ampliada");
  closeButton.textContent = "×";

  const enlargedPhoto = document.createElement("img");
  enlargedPhoto.className = "photo-lightbox__image";
  enlargedPhoto.alt = "";

  dialog.append(closeButton, enlargedPhoto);
  document.body.append(dialog);

  let activePhoto = null;

  function syncPhotoAccessibility(photo) {
    const slide = photo.closest("[data-promo-slide]");
    const hiddenSlide = slide && slide.getAttribute("aria-hidden") === "true";
    photo.tabIndex = hiddenSlide ? -1 : 0;
  }

  function openPhoto(photo) {
    activePhoto = photo;
    enlargedPhoto.src = photo.currentSrc || photo.src;
    enlargedPhoto.alt = photo.alt || "Foto do Vila Prime";
    dialog.setAttribute(
      "aria-label",
      photo.alt ? "Foto ampliada: " + photo.alt : "Foto ampliada do Vila Prime",
    );
    dialog.showModal();
    closeButton.focus();
  }

  photos.forEach(function (photo) {
    photo.classList.add("photo-zoomable");
    photo.setAttribute("role", "button");
    photo.setAttribute("aria-haspopup", "dialog");
    photo.setAttribute(
      "aria-label",
      "Ampliar foto: " + (photo.alt || "foto do Vila Prime"),
    );
    photo.setAttribute("draggable", "false");
    syncPhotoAccessibility(photo);

    photo.addEventListener("click", function () {
      openPhoto(photo);
    });
    photo.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPhoto(photo);
      }
    });
  });

  const carousel = document.querySelector("[data-promo-carousel]");
  if (carousel && typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver(function () {
      photos.forEach(syncPhotoAccessibility);
    });
    observer.observe(carousel, {
      attributes: true,
      attributeFilter: ["aria-hidden"],
      subtree: true,
    });
  }

  closeButton.addEventListener("click", function () {
    dialog.close();
  });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", function () {
    enlargedPhoto.removeAttribute("src");
    if (activePhoto) {
      activePhoto.focus({ preventScroll: true });
      activePhoto = null;
    }
  });
})();
