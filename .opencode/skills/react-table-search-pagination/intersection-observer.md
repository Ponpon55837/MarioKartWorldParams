# React Intersection Observer API 實作指南

## 概述

Intersection Observer 是一項強大的 Web API，能在不消耗大量 CPU 效能的情況下，偵測元素與視窗或特定祖先元素的重疊狀態，解決了過往監聽 `scroll` 事件導致頁面卡頓的效能問題。

---

## 目錄

1. [核心概念](#1-核心概念)
2. [原生 JavaScript 實作](#2-原生-javascript-實作)
3. [React 實作](#3-react-實作)
4. [開發注意事項](#4-開發注意事項)

---

## 1. 核心概念

Intersection Observer 提供了一種異步監測目標元素與其祖先元素或頂級文檔視窗交叉狀態的方法。相比傳統的 scroll 事件監聽，它具有以下優勢：

- **高效能**：不會造成主執行緒阻塞
- **精確偵測**：可設定觸發閾值和邊界
- **資源節省**：內建節流機制，避免頻繁觸發

---

## 2. 原生 JavaScript 實作

### 圖片懶加載 (Lazy Loading)

**應用場景**：當使用者滑動到圖片附近時才開始下載，節省初始流量。

```javascript
const lazyImages = document.querySelectorAll("img[data-src]");

const imageObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src; // 切換為真實路徑
        img.onload = () => img.classList.add("fade-in");
        observer.unobserve(img); // 載入後停止觀測
      }
    });
  },
  {
    rootMargin: "0px 0px 200px 0px", // 提前 200px 預載
  },
);

lazyImages.forEach((img) => imageObserver.observe(img));
```

**關鍵細節**：

- 使用 `data-src` 存放路徑，觸發後再轉入 `src`
- `rootMargin: '0px 0px 200px 0px'` 提前 200px 預載，提升體驗
- 載入完成後 `unobserve`，釋放資源

### 影片自動播放/暫停 (Video Control)

**應用場景**：類似社群媒體動態牆，影片進入視線時自動播放。

```javascript
const video = document.querySelector("video");

const videoObserver = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      entry.target.play().catch(() => {}); // 靜音才能自動播放
    } else {
      entry.target.pause();
    }
  },
  { threshold: 0.5 }, // 露出 50% 面積才執行
);

videoObserver.observe(video);
```

### 吸附式導覽列切換 (Sticky Header)

**應用場景**：當頁面下滑超過一定距離後，導覽列固定於頂部並改變樣式。

```javascript
// 在 Header 上方放一個 1px 的隱形哨兵 (Sentinel)
const sentinel = document.querySelector(".sentinel");
const header = document.querySelector(".main-header");

const stickyObserver = new IntersectionObserver(([entry]) => {
  // 當哨兵「離開」視窗時，表示頁面已下捲超過該點
  header.classList.toggle("is-sticky", !entry.isIntersecting);
});

stickyObserver.observe(sentinel);
```

---

## 3. React 實作

### 通用自定義 Hook：useIntersection

```javascript
import { useState, useEffect, useRef } from "react";

export const useIntersection = (options) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    const currentTarget = targetRef.current;
    if (currentTarget) observer.observe(currentTarget);

    // 務必 Cleanup：防止記憶體洩漏
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
      observer.disconnect();
    };
  }, [options]);

  return [targetRef, isIntersecting];
};
```

### 滾動觸發動畫 (Scroll Animation)

**應用場景**：內容隨著捲動逐一淡入呈現，增加視覺質感。

```javascript
const ScrollReveal = ({ children }) => {
  const [ref, isVisible] = useIntersection({ threshold: 0.2 });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setHasAnimated(true); // 觸發後即固定狀態
    }
  }, [isVisible]);

  return (
    <div ref={ref} className={`box ${hasAnimated ? "reveal" : ""}`}>
      {children}
    </div>
  );
};
```

### 廣告有效曝光追蹤 (Ad Viewability)

**應用場景**：計算廣告是否被真正看見（顯示 50% 以上且停留 1 秒）。

```javascript
const AdComponent = ({ adId }) => {
  const [ref, isVisible] = useIntersection({ threshold: 0.5 });

  useEffect(() => {
    let timer;

    if (isVisible) {
      timer = setTimeout(() => {
        // 執行追蹤 API
        console.log(`Ad ${adId} tracked successfully!`);
      }, 1000);
    }

    // 移出視窗即重計，避免無效曝光
    return () => clearTimeout(timer);
  }, [isVisible, adId]);

  return (
    <div ref={ref} className="ad-unit">
      廣告內容
    </div>
  );
};
```

### 文章目錄導覽自動高亮 (Active Nav)

**應用場景**：長文章側邊欄隨閱讀進度切換 Highlight。

```javascript
const Documentation = () => {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 當標題進入視窗上方特定範圍時更新
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-10% 0px -80% 0px", // 上方 10%，下方 80%
      },
    );

    document.querySelectorAll("h2[id]").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <nav>
      <a className={activeId === "sec1" ? "active" : ""} href="#sec1">
        第一章
      </a>
      <a className={activeId === "sec2" ? "active" : ""} href="#sec2">
        第二章
      </a>
    </nav>
  );
};
```

---

## 4. 開發注意事項 (Checklist)

| 項目           | 關鍵細節                                    | 備註                          |
| -------------- | ------------------------------------------- | ----------------------------- |
| **效能防護**   | 執行一次後立即調用 `unobserve()`            | 適用於懶加載與單次顯示動畫    |
| **Cleanup**    | React useEffect 中務必執行 `disconnect()`   | 避免 SPA 切換頁面後殘留監聽器 |
| **Threshold**  | 設定 `1.0` 代表元素需 100% 露出才觸發       | 通常設定 `0.1 ~ 0.2` 體感最佳 |
| **rootMargin** | 格式為 `"上 右 下 左"` (例如 `"100px 0px"`) | 可用於「預加載」機制          |

### 常見選項說明

```javascript
const options = {
  root: document.querySelector("#scrollArea"), // 根元素，null 為 viewport
  rootMargin: "0px", // 邊界偏移，類似 CSS margin
  threshold: [0, 0.25, 0.5, 0.75, 1.0], // 觸發閾值陣列
};
```

### 錯誤處理

```javascript
const SafeIntersectionObserver = ({ children, options }) => {
  const [isSupported, setIsSupported] = useState(true);
  const [ref, isVisible] = useIntersection(options);

  useEffect(() => {
    // 檢查瀏覽器支援度
    if (!window.IntersectionObserver) {
      setIsSupported(false);
    }
  }, []);

  if (!isSupported) {
    // 回退方案：直接顯示內容
    return <div>{children}</div>;
  }

  return <div ref={ref}>{isVisible ? children : null}</div>;
};
```

---

## 開發檢查清單

| 檢查項目       | 關鍵細節                               | 預期結果         |
| -------------- | -------------------------------------- | ---------------- |
| **瀏覽器支援** | 是否檢查 IntersectionObserver 支援度？ | 提供回退方案     |
| **Cleanup**    | useEffect 中是否有正確的清理？         | 避免記憶體洩漏   |
| **效能優化**   | 是否使用 `unobserve()` 釋放資源？      | 避免不必要的監聽 |
| **閾值設定**   | threshold 是否符合使用場景？           | 精確觸發時機     |
| **邊界設定**   | rootMargin 是否合理？                  | 提升使用者體驗   |

---

**版本**：1.0  
**最後更新**：2025-01-28  
**適用範圍**：React 18+, Next.js 13+ (App Router)
