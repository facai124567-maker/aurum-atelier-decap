const fs = require("fs");
const path = require("path");

const root = __dirname;
const contentDir = path.join(root, "content");
const productsDir = path.join(contentDir, "products");
const distDir = path.join(root, "dist");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

function readJSON(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const sanitized = raw.replace(/^\uFEFF/, "");
  return JSON.parse(sanitized);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      ensureDir(path.dirname(destPath));
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function formatPrice(value) {
  const number = Number(value);
  if (Number.isFinite(number)) {
    return `$${number}`;
  }
  return `$${value}`;
}

const site = readJSON(path.join(contentDir, "site.json"));
const products = fs
  .readdirSync(productsDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => {
    const filePath = path.join(productsDir, file);
    const data = readJSON(filePath);
    const stat = fs.statSync(filePath);
    return {
      ...data,
      __mtime: stat.mtimeMs,
    };
  })
  .sort((a, b) => b.__mtime - a.__mtime);

const copy = {
  en: {
    lang: "en",
    langAlt: "zh-CN",
    nav: {
      collections: "Collections",
      craft: "Craft",
      reviews: "Reviews",
      service: "Service"
    },
    sections: {
      collections: "Signature Collections",
      collectionsLead: "Curated lines for every moment — contemporary cases, sapphire crystal, and dependable movements.",
      craft: "Crafted by Specialists",
      craftLead: "Each watch is assembled by a dedicated master and tested across 28 checkpoints for accuracy, durability, and finish.",
      reviews: "Client Impressions",
      reviewsLead: "Collectors from 40+ countries trust Aurum Atelier for design consistency and service.",
      service: "Concierge-Level Service",
      serviceLead: "Dedicated advisors help you choose the right size, movement, and strap, with 24/7 multi-language support."
    },
    footer: {
      shop: "Shop",
      company: "Company",
      contact: "Contact",
      all: "All Watches",
      limited: "Limited Editions",
      concierge: "Watch Concierge",
      craft: "Craftsmanship",
      reviews: "Client Reviews",
      warranty: "Warranty",
      email: "concierge@aurumatelier.com",
      phone: "+1 (888) 555-2188",
      address: "Fifth Avenue, New York"
    },
    product: {
      breadcrumbHome: "Home",
      breadcrumbCollections: "Collections",
      highlights: "Key Highlights",
      craftTitle: "Craft & Finish",
      boxTitle: "What’s in the Box",
      reviewsTitle: "Collector Reviews",
      faqTitle: "Frequently Asked",
      relatedTitle: "Related Models",
      consultTitle: "Concierge Consultation",
      consultCopy: "Share your wrist size and preferred strap. Our advisors reply within 12 hours.",
      consultBtn: "Request Consultation",
      compareLabel: "Includes international warranty, serialized certificate, and quick-release strap tool.",
      deliveryTitle: "Delivery & Service",
      deliveryCopy: "Ships in 48 hours. EU customs-cleared routes available. 24/7 multi-language concierge support.",
      inquireBtn: "Inquire Now",
      specsBtn: "View Specifications"
    }
  },
  zh: {
    lang: "zh-CN",
    langAlt: "en",
    nav: {
      collections: "系列",
      craft: "工艺",
      reviews: "评价",
      service: "服务"
    },
    sections: {
      collections: "标志性系列",
      collectionsLead: "为每个场合打造 — 现代表壳、蓝宝石镜面与稳定机芯。",
      craft: "匠心工艺",
      craftLead: "每只腕表由专属制表师装配，并通过 28 项精准与耐用测试。",
      reviews: "客户评价",
      reviewsLead: "来自 40+ 国家收藏者信赖 Aurum Atelier 的设计与服务。",
      service: "腕表管家服务",
      serviceLead: "专属顾问帮助选择尺寸、机芯与表带，并提供 24/7 多语言支持。"
    },
    footer: {
      shop: "选购",
      company: "品牌",
      contact: "联系",
      all: "全部腕表",
      limited: "限量版",
      concierge: "腕表管家",
      craft: "匠心工艺",
      reviews: "客户评价",
      warranty: "保修政策",
      email: "concierge@aurumatelier.com",
      phone: "+1 (888) 555-2188",
      address: "纽约第五大道"
    },
    product: {
      breadcrumbHome: "首页",
      breadcrumbCollections: "系列",
      highlights: "核心亮点",
      craftTitle: "工艺与质感",
      boxTitle: "随表附赠",
      reviewsTitle: "买家评价",
      faqTitle: "常见问题",
      relatedTitle: "相关推荐",
      consultTitle: "咨询购买",
      consultCopy: "告诉我们你的腕围与表带偏好，我们将在 12 小时内回复。",
      consultBtn: "提交咨询",
      compareLabel: "含编号证书、快拆工具与 2 年国际保修服务。",
      deliveryTitle: "配送与服务",
      deliveryCopy: "48 小时内发货，支持欧盟清关路线。7×24 多语言顾问在线。",
      inquireBtn: "咨询购买",
      specsBtn: "查看参数"
    }
  }
};

function renderHead({ title, description, canonical, hreflang, lang }) {
  return `
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="en" href="${hreflang.en}" />
  <link rel="alternate" hreflang="zh-CN" href="${hreflang.zh}" />
  <link rel="alternate" hreflang="x-default" href="${hreflang.default}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:site_name" content="Aurum Atelier" />
  <meta property="og:locale" content="${lang === "en" ? "en_US" : "zh_CN"}" />
  <meta property="og:locale:alternate" content="${lang === "en" ? "zh_CN" : "en_US"}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <link rel="stylesheet" href="/assets/style.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap" />
`;
}

function renderHeader(lang) {
  const text = copy[lang];
  const otherLang = lang === "en" ? "zh" : "en";
  const langUrl = lang === "en" ? "/en/" : "/zh/";
  const otherUrl = otherLang === "en" ? "/en/" : "/zh/";
  return `
  <header>
    <div class="container nav">
      <div class="brand" aria-label="Aurum Atelier">
        <div class="brand-badge">AA</div>
        <span>Aurum Atelier</span>
      </div>
      <nav aria-label="Primary">
        <ul>
          <li><a href="${langUrl}#collections">${text.nav.collections}</a></li>
          <li><a href="${langUrl}#craft">${text.nav.craft}</a></li>
          <li><a href="${langUrl}#reviews">${text.nav.reviews}</a></li>
          <li><a href="${langUrl}#service">${text.nav.service}</a></li>
        </ul>
      </nav>
      <div class="lang-switch" role="navigation" aria-label="Language">
        <a class="${lang === "en" ? "active" : ""}" href="${langUrl}" lang="en" aria-current="${lang === "en" ? "page" : "false"}">English</a>
        <a class="${lang === "zh" ? "active" : ""}" href="${otherUrl}" lang="zh-CN" aria-current="${lang === "zh" ? "page" : "false"}">中文</a>
      </div>
    </div>
  </header>
`;
}

function renderHero(lang) {
  const data = site[lang];
  return `
  <section class="hero container">
    <div>
      <p class="pill">${escapeHtml(data.hero_pill)}</p>
      <h1>${escapeHtml(data.hero_title)}</h1>
      <p>${escapeHtml(data.hero_subtitle)}</p>
      <div class="cta-row">
        <a class="btn primary" href="#collections">${escapeHtml(data.cta_primary)}</a>
        <a class="btn secondary" href="#service">${escapeHtml(data.cta_secondary)}</a>
      </div>
    </div>
    <div class="hero-card">
      <img src="/assets/uploads/solace-automatic.jpg" alt="${lang === "en" ? "Luxury wristwatch on black background" : "黑色背景上的腕表"}" loading="lazy" />
      <div class="stat-grid">
        <div class="stat">
          <strong>12+ ${lang === "en" ? "Years" : "年"}</strong>
          <span>${lang === "en" ? "Design Heritage" : "设计沉淀"}</span>
        </div>
        <div class="stat">
          <strong>2 ${lang === "en" ? "Years" : "年"}</strong>
          <span>${lang === "en" ? "International Warranty" : "全球保修"}</span>
        </div>
        <div class="stat">
          <strong>48h</strong>
          <span>${lang === "en" ? "Dispatch Window" : "发货时效"}</span>
        </div>
      </div>
    </div>
  </section>
`;
}

function renderProductCard(product, lang) {
  const name = lang === "en" ? product.name_en : product.name_zh;
  const desc = lang === "en" ? product.desc_en : product.desc_zh;
  const tags = (lang === "en" ? product.tags_en : product.tags_zh) || [];
  const visibleTags = tags.slice(0, 4);
  const extraCount = tags.length - visibleTags.length;
  const url = `/${lang}/${product.slug}/`;
  return `
  <article class="product">
    <a href="${url}">
      <img src="${product.images.main}" alt="${escapeHtml(name)}" loading="lazy" />
    </a>
    <h3>${escapeHtml(name)}</h3>
    <p>${escapeHtml(desc)}</p>
    <div class="pill-row">
      ${visibleTags.map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}
      ${extraCount > 0 ? `<span class="pill">+${extraCount}</span>` : ""}
    </div>
    <span class="price">${formatPrice(product.price)}</span>
    <a class="btn secondary" href="${url}">${lang === "en" ? "View Details" : "查看详情"}</a>
  </article>
`;
}

function renderHome(lang) {
  const text = copy[lang];
  const meta = site[lang];
  const hreflang = {
    en: "https://aurum-atelier-decap.pages.dev/en/",
    zh: "https://aurum-atelier-decap.pages.dev/zh/",
    default: "https://aurum-atelier-decap.pages.dev/"
  };
  const body = `
${renderHeader(lang)}
<main>
  ${renderHero(lang)}

  <section id="collections" class="section container">
    <h2>${text.sections.collections}</h2>
    <p class="lead">${text.sections.collectionsLead}</p>
    <div class="grid products">
      ${products.map((product) => renderProductCard(product, lang)).join("")}
    </div>
  </section>

  <section id="craft" class="section container">
    <div class="split">
      <div>
        <h2>${text.sections.craft}</h2>
        <p class="lead">${text.sections.craftLead}</p>
        <div class="grid feature-grid">
          <div class="feature">
            <h3>${lang === "en" ? "Precision Movements" : "精准机芯"}</h3>
            <p>${lang === "en" ? "Swiss-inspired automatic and quartz movements regulated to tight tolerances." : "瑞士灵感机械与石英机芯，调校精准稳定。"}</p>
          </div>
          <div class="feature">
            <h3>${lang === "en" ? "Premium Materials" : "优质材质"}</h3>
            <p>${lang === "en" ? "Sapphire crystal, 316L steel, and Italian leather straps." : "蓝宝石镜面、316L 精钢与意大利皮表带。"}</p>
          </div>
          <div class="feature">
            <h3>${lang === "en" ? "Small-Batch QC" : "小批量品控"}</h3>
            <p>${lang === "en" ? "Limited production runs ensure consistent finishing and alignment." : "小批量生产确保细节一致与品质稳定。"}</p>
          </div>
        </div>
      </div>
      <div class="hero-card">
        <h3>${lang === "en" ? "What You Receive" : "随表附赠"}</h3>
        <p>${lang === "en" ? "Your watch arrives with a serialized certificate, quick-release strap tool, and a two-year international warranty." : "腕表含编号证书、快拆工具与 2 年国际保修。"}</p>
        <div class="badge-row">
          <span class="badge">${lang === "en" ? "Free Worldwide Delivery" : "全球免邮"}</span>
          <span class="badge">${lang === "en" ? "EU Customs-Cleared Shipping" : "欧盟清关配送"}</span>
          <span class="badge">${lang === "en" ? "Live Chat & Phone Support" : "在线聊天与电话支持"}</span>
        </div>
      </div>
    </div>
  </section>

  <section id="reviews" class="section container">
    <h2>${text.sections.reviews}</h2>
    <p class="lead">${text.sections.reviewsLead}</p>
    <div class="grid feature-grid">
      <div class="testimonial">
        <p>${lang === "en" ? "\"Balanced proportions and the lume is stunning. Shipping arrived in four days.\"" : "“比例均衡，夜光非常惊艳，四天就收到了。”"}</p>
        <strong>Daniel / ${lang === "en" ? "London" : "伦敦"}</strong>
      </div>
      <div class="testimonial">
        <p>${lang === "en" ? "\"The finishing rivals brands twice the price. Excellent support.\"" : "“做工堪比两倍价位品牌，客服也很专业。”"}</p>
        <strong>Ming / ${lang === "en" ? "Hong Kong" : "香港"}</strong>
      </div>
      <div class="testimonial">
        <p>${lang === "en" ? "\"My Solstice Chrono became my daily watch. Comfortable and accurate.\"" : "“Solstice 计时款成了我的日常表，佩戴舒适且精准。”"}</p>
        <strong>Avery / ${lang === "en" ? "New York" : "纽约"}</strong>
      </div>
    </div>
  </section>

  <section id="service" class="section container">
    <div class="split">
      <div>
        <h2>${text.sections.service}</h2>
        <p class="lead">${text.sections.serviceLead}</p>
        <div class="grid feature-grid">
          <div class="feature">
            <h3>${lang === "en" ? "Sizing Guidance" : "尺寸建议"}</h3>
            <p>${lang === "en" ? "Instant chat for wrist-size recommendations and strap swaps." : "即时沟通腕围测量与表带更换建议。"}</p>
          </div>
          <div class="feature">
            <h3>${lang === "en" ? "Global Warranty" : "全球保修"}</h3>
            <p>${lang === "en" ? "Two-year international coverage with local repair centers." : "2 年国际保障与本地维修网络。"}</p>
          </div>
          <div class="feature">
            <h3>${lang === "en" ? "Safe Payments" : "安全支付"}</h3>
            <p>${lang === "en" ? "Encrypted checkout with cards, bank transfer, and digital wallets." : "加密结算，支持信用卡、转账与电子钱包。"}</p>
          </div>
        </div>
      </div>
      <div class="hero-card">
        <h3>${lang === "en" ? "Frequently Asked" : "常见问题"}</h3>
        <div class="faq">
          <details open>
            <summary>${lang === "en" ? "How long is delivery?" : "配送需要多久？"}</summary>
            <p>${lang === "en" ? "Most orders ship within 48 hours and arrive in 4-8 business days." : "大多数订单 48 小时内发货，4-8 个工作日送达。"}</p>
          </details>
          <details>
            <summary>${lang === "en" ? "Can I exchange straps?" : "可以更换表带吗？"}</summary>
            <p>${lang === "en" ? "Yes, quick-release straps are interchangeable across collections." : "可以，快拆表带适用于各系列。"}</p>
          </details>
          <details>
            <summary>${lang === "en" ? "Do you provide authenticity papers?" : "提供真实性证书吗？"}</summary>
            <p>${lang === "en" ? "Every watch includes a serialized certificate and care manual." : "每只腕表均含编号证书与使用说明。"}</p>
          </details>
        </div>
      </div>
    </div>
  </section>

  <section class="section container">
    <div class="newsletter">
      <h2>${lang === "en" ? "Join the Atelier" : "加入 Atelier"}</h2>
      <p>${lang === "en" ? "Get early access to new launches, limited editions, and private events." : "抢先了解新品、限量款与私享活动。"}</p>
      <form>
        <input type="email" name="email" autocomplete="email" placeholder="${lang === "en" ? "Enter your email" : "输入邮箱地址"}" required />
        <button class="btn primary" type="submit">${lang === "en" ? "Subscribe" : "订阅"}</button>
      </form>
    </div>
  </section>
</main>

<footer>
  <div class="container footer-grid">
    <div>
      <div class="brand">
        <div class="brand-badge">AA</div>
        <span>Aurum Atelier</span>
      </div>
      <p>${lang === "en" ? "Modern luxury watches with precision craftsmanship." : "现代奢华腕表，精准工艺之选。"}</p>
    </div>
    <div>
      <strong>${text.footer.shop}</strong>
      <a href="#collections">${text.footer.all}</a>
      <a href="#collections">${text.footer.limited}</a>
      <a href="#service">${text.footer.concierge}</a>
    </div>
    <div>
      <strong>${text.footer.company}</strong>
      <a href="#craft">${text.footer.craft}</a>
      <a href="#reviews">${text.footer.reviews}</a>
      <a href="#service">${text.footer.warranty}</a>
    </div>
    <div>
      <strong>${text.footer.contact}</strong>
      <a href="mailto:${text.footer.email}">${text.footer.email}</a>
      <a href="tel:${text.footer.phone.replace(/\s+/g, "")}">${text.footer.phone}</a>
      <span>${text.footer.address}</span>
    </div>
  </div>
</footer>
`;

  const html = `<!doctype html>
<html lang="${copy[lang].lang}">
<head>${renderHead({
    title: meta.meta_title,
    description: meta.meta_description,
    canonical: `https://aurum-atelier.pages.dev/${lang}/`,
    hreflang,
    lang
  })}</head>
<body class="aurum-page aurum-${lang}">
${body}
</body>
</html>`;

  return html;
}

function renderProductPage(product, lang) {
  const text = copy[lang];
  const name = lang === "en" ? product.name_en : product.name_zh;
  const subtitle = lang === "en" ? product.subtitle_en : product.subtitle_zh;
  const specs = lang === "en" ? product.specs_en : product.specs_zh;
  const specTable = lang === "en" ? product.spec_table_en : product.spec_table_zh;
  const tags = lang === "en" ? product.tags_en : product.tags_zh;
  const gallery = product.images.gallery || [];
  const otherLang = lang === "en" ? "zh" : "en";
  const canonical = `https://aurum-atelier-decap.pages.dev/${lang}/${product.slug}/`;
  const hreflang = {
    en: `https://aurum-atelier-decap.pages.dev/en/${product.slug}/`,
    zh: `https://aurum-atelier-decap.pages.dev/zh/${product.slug}/`,
    default: `https://aurum-atelier-decap.pages.dev/`
  };
  const related = getRelatedProducts(product.slug, 3);

  const body = `
${renderHeader(lang)}
<main class="container product-detail">
  <div class="breadcrumb">
    <a href="/${lang}/">${text.product.breadcrumbHome}</a> / <a href="/${lang}/#collections">${text.product.breadcrumbCollections}</a> / ${escapeHtml(name)}
  </div>

  <section class="product-hero">
    <div class="gallery">
      <div class="gallery-main">
        <img src="${product.images.main}" alt="${escapeHtml(name)}" />
      </div>
      <div class="gallery-thumbs">
        ${gallery.map((image) => `<img src="${image}" alt="${escapeHtml(name)}" />`).join("")}
      </div>
    </div>

    <div class="product-summary">
      <h1>${escapeHtml(name)}</h1>
      <p class="subtitle">${escapeHtml(subtitle)}</p>
      <div class="tagline-row">
        ${tags.map((tag) => `<span class="tagline">${escapeHtml(tag)}</span>`).join("")}
      </div>

      <div class="sticky-panel">
        <div class="price-card">
          <div class="price-row">
            <span class="price">${formatPrice(product.price)}</span>
            <span class="compare">${formatPrice(product.compare_price || 398)}</span>
          </div>
          <p class="subtitle">${text.product.compareLabel}</p>
          <div class="cta-stack">
            <a class="btn primary" href="#contact">${text.product.inquireBtn}</a>
            <a class="btn secondary" href="#specs">${text.product.specsBtn}</a>
          </div>
        </div>

        <div class="shipping-box">
          <strong>${text.product.deliveryTitle}</strong>
          <p>${text.product.deliveryCopy}</p>
        </div>
      </div>
    </div>
  </section>

  <section id="specs" class="detail-section">
    <h2>${text.product.highlights}</h2>
    <div class="spec-grid">
      ${specs
        .map((spec) => `<div class="spec"><span>${escapeHtml(spec.label)}</span><strong>${escapeHtml(spec.value)}</strong></div>`)
        .join("")}
    </div>

    <table class="spec-table">
      ${specTable
        .map((row) => `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td></tr>`)
        .join("")}
    </table>
  </section>

  <section class="detail-section">
    <h2>${text.product.craftTitle}</h2>
    <div class="detail-grid">
      <div class="detail-card">
        <h3>${lang === "en" ? "Mirror-Grade Casework" : "镜面级表壳"}</h3>
        <p>${lang === "en" ? "Multi-stage polishing delivers crisp reflections with hand-finished edges and precise alignment." : "多道抛光工序打造清晰反射面，边缘线条利落。"}</p>
      </div>
      <div class="detail-card">
        <h3>${lang === "en" ? "Sapphire Clarity" : "清晰读数"}</h3>
        <p>${lang === "en" ? "Anti-reflective sapphire crystal keeps the dial clear in direct light and evening conditions." : "蓝宝石镜面配合防眩镀膜，强光下依然清晰。"}</p>
      </div>
      <div class="detail-card">
        <h3>${lang === "en" ? "Balanced Wearing Comfort" : "佩戴舒适"}</h3>
        <p>${lang === "en" ? "Curved lugs and quick-release strap system keep the case secure and comfortable." : "弧形表耳与快拆表带让表壳更贴合手腕。"}</p>
      </div>
    </div>
  </section>

  <section class="detail-section">
    <h2>${text.product.boxTitle}</h2>
    <div class="detail-grid">
      <div class="detail-card">
        <h3>${lang === "en" ? "Serialized Certificate" : "编号证书"}</h3>
        <p>${lang === "en" ? "Each watch includes a numbered certificate and inspection card." : "每只腕表配有编号证书与质检卡。"}</p>
      </div>
      <div class="detail-card">
        <h3>${lang === "en" ? "Quick-Release Tool" : "快拆工具"}</h3>
        <p>${lang === "en" ? "Swap straps in seconds with the included tool and guide." : "随附表带快拆工具与使用指南。"}</p>
      </div>
      <div class="detail-card">
        <h3>${lang === "en" ? "Protective Travel Case" : "旅行保护盒"}</h3>
        <p>${lang === "en" ? "Keep your watch secure in a padded, compact carrying case." : "轻便防护收纳盒，日常携带更安心。"}</p>
      </div>
    </div>
  </section>

  <section class="detail-section">
    <h2>${text.product.reviewsTitle}</h2>
    <div class="grid feature-grid">
      <div class="testimonial">
        <p>${lang === "en" ? "The finishing is impeccable and the lume is strong. Feels balanced on wrist." : "抛光质感很高级，夜光效果特别亮。"}</p>
        <strong>Chris / ${lang === "en" ? "Singapore" : "新加坡"}</strong>
      </div>
      <div class="testimonial">
        <p>${lang === "en" ? "Dial texture is outstanding. The movement keeps steady time." : "表盘纹理很好看，走时稳定。"}</p>
        <strong>Elena / ${lang === "en" ? "Milan" : "米兰"}</strong>
      </div>
      <div class="testimonial">
        <p>${lang === "en" ? "Fast delivery and great support. The strap system is super convenient." : "物流很快，客服响应也很及时。"}</p>
        <strong>Jordan / ${lang === "en" ? "Toronto" : "多伦多"}</strong>
      </div>
    </div>
  </section>

  <section class="detail-section">
    <h2>${text.product.faqTitle}</h2>
    <div class="faq">
      <details open>
        <summary>${lang === "en" ? "Is the watch covered by warranty?" : "是否提供保修？"}</summary>
        <p>${lang === "en" ? "Yes, every piece includes a 2-year international warranty with local service options." : "提供 2 年国际保修，可使用本地维修服务。"}</p>
      </details>
      <details>
        <summary>${lang === "en" ? "How long does shipping take?" : "多久发货？"}</summary>
        <p>${lang === "en" ? "Orders ship within 48 hours and typically arrive in 4-8 business days." : "下单后 48 小时内发货，通常 4-8 个工作日送达。"}</p>
      </details>
      <details>
        <summary>${lang === "en" ? "Can I swap the strap?" : "表带可更换吗？"}</summary>
        <p>${lang === "en" ? "Yes, the quick-release system supports fast strap changes." : "支持快拆表带系统，几秒即可完成更换。"}</p>
      </details>
    </div>
  </section>

  <section class="detail-section">
    <h2>${text.product.relatedTitle}</h2>
    <div class="related-grid">
      ${related
        .map((item) => `
          <article class="related-card">
            <img src="${item.images.main}" alt="${escapeHtml(lang === "en" ? item.name_en : item.name_zh)}" />
            <h3>${escapeHtml(lang === "en" ? item.name_en : item.name_zh)}</h3>
            <p>${escapeHtml(lang === "en" ? item.desc_en : item.desc_zh)}</p>
            <span class="price">${formatPrice(item.price)}</span>
          </article>
        `)
        .join("")}
    </div>
  </section>

  <section id="contact" class="detail-section">
    <div class="newsletter">
      <h2>${text.product.consultTitle}</h2>
      <p>${text.product.consultCopy}</p>
      <form>
        <input type="email" name="email" autocomplete="email" placeholder="${lang === "en" ? "Enter your email" : "输入邮箱地址"}" required />
        <button class="btn primary" type="submit">${text.product.consultBtn}</button>
      </form>
    </div>
  </section>
</main>
`;

  const html = `<!doctype html>
<html lang="${copy[lang].lang}">
<head>${renderHead({
    title: `${name} | Aurum Atelier`,
    description: subtitle,
    canonical,
    hreflang,
    lang
  })}</head>
<body class="aurum-page aurum-product">
${body}
<script type="application/ld+json">
${JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "image": product.images.gallery && product.images.gallery.length ? product.images.gallery : [product.images.main],
    "description": subtitle,
    "brand": {
      "@type": "Brand",
      "name": "Aurum Atelier"
    },
    "sku": `AA-${product.slug.toUpperCase()}-${product.price}`,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": String(product.price),
      "availability": "https://schema.org/InStock",
      "url": canonical
    }
  },
  null,
  2
)}
</script>
</body>
</html>`;

  return html;
}

function getRelatedProducts(slug, count) {
  const index = products.findIndex((product) => product.slug === slug);
  if (index === -1) return products.slice(0, count);
  const result = [];
  for (let i = 1; i <= count; i++) {
    result.push(products[(index + i) % products.length]);
  }
  return result;
}

function renderLanguageSelector() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Choose Language | 选择语言</title>
  <meta name="description" content="Choose your language to view the watch collection. 请选择语言以浏览腕表系列。" />
  <meta name="robots" content="noindex,follow" />
  <link rel="canonical" href="https://aurum-atelier-decap.pages.dev/" />
  <link rel="alternate" hreflang="en" href="https://aurum-atelier-decap.pages.dev/en/" />
  <link rel="alternate" hreflang="zh-CN" href="https://aurum-atelier-decap.pages.dev/zh/" />
  <link rel="alternate" hreflang="x-default" href="https://aurum-atelier-decap.pages.dev/" />
  <link rel="stylesheet" href="/assets/style.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap" />
</head>
<body class="lang-page">
  <main class="lang-panel">
    <h1>Choose Language / 选择语言</h1>
    <p>Select a language to view the watch collection. 请选择语言以浏览腕表系列。</p>
    <div class="btn-row">
      <a class="btn primary" href="/en/" lang="en">English</a>
      <a class="btn" href="/zh/" lang="zh-CN">中文</a>
    </div>
    <p class="note">Redirecting in <span id="countdown-en">3</span>s… / 正在跳转，剩余 <span id="countdown-zh">3</span> 秒…</p>
    <noscript>
      <p class="note">JavaScript 已关闭，请手动选择语言。</p>
    </noscript>
  </main>

  <script>
    (function () {
      var lang = (navigator.language || "en").toLowerCase();
      var target = lang.indexOf("zh") !== -1 ? "/zh/" : "/en/";
      var seconds = 3;
      var counterEn = document.getElementById("countdown-en");
      var counterZh = document.getElementById("countdown-zh");

      function tick() {
        if (counterEn) counterEn.textContent = seconds;
        if (counterZh) counterZh.textContent = seconds;
        if (seconds <= 0) {
          window.location.replace(target);
          return;
        }
        seconds -= 1;
        setTimeout(tick, 1000);
      }

      if (window.location.pathname === "/") {
        tick();
      }
    })();
  </script>
</body>
</html>`;
}

function build() {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  ensureDir(distDir);

  writeFile(path.join(distDir, "index.html"), renderLanguageSelector());
  writeFile(path.join(distDir, "en", "index.html"), renderHome("en"));
  writeFile(path.join(distDir, "zh", "index.html"), renderHome("zh"));

  for (const product of products) {
    writeFile(path.join(distDir, "en", product.slug, "index.html"), renderProductPage(product, "en"));
    writeFile(path.join(distDir, "zh", product.slug, "index.html"), renderProductPage(product, "zh"));
  }

  const redirects = products
    .map((product) => `/${product.slug}/ /en/${product.slug}/ 301`)
    .concat(products.map((product) => `/zh/${product.slug}-zh/ /zh/${product.slug}/ 301`))
    .concat(products.map((product) => `/${product.slug}-zh/ /zh/${product.slug}/ 301`))
    .join("\n");
  writeFile(path.join(distDir, "_redirects"), redirects);

  copyDir(path.join(root, "assets"), path.join(distDir, "assets"));
  copyDir(path.join(root, "admin"), path.join(distDir, "admin"));
  copyDir(path.join(root, "functions"), path.join(distDir, "functions"));
}

build();
