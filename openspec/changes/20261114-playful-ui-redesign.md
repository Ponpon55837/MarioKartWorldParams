---
type: feature
title: "介面改版：賽道遊戲風格與組合賽跑"
date: 2026-11-14
description: >
  依 unslop 設計原則重新規劃介面：外框保持安靜，把豐富的視覺集中在
  「角色焦點區」與「組合賽跑」兩個重點。角色與載具依性能分組，
  以跑法顏色、雷達圖與賽道卡丁車呈現，取代原本的數字進度條與卡片牆。

components:
  - name: "版面框架"
    location: ["src/components/layout/", "src/app/page.tsx", "src/app/admin/page.tsx"]
    changes:
      - 左側導覽列（米白底＋紅白賽道邊線）取代彩色漸層頁首與分頁按鈕
      - 主題切換、語言、資料管理移到導覽列底部
      - 管理頁共用同一個版面框架
    impact: "導覽一致，首屏不再被說明區塊佔滿"

  - name: "性能分組與跑法"
    location: ["src/utils/profile.ts", "src/store/dataAtoms.ts"]
    changes:
      - 以能力值簽章（Hash Map）把相同數值的角色/載具合併，O(n·k)
      - 依速度與加速差判斷跑法（速度型／平衡型／加速型），依重量判斷體型
      - 強弱項描述與最適合賽道以整數比較計算
      - 以單一「賽道」篩選取代速度、操控兩個篩選器與排序下拉選單
    impact: "50 位角色收斂為 20 種性能，挑選更直覺"

  - name: "組合賽跑"
    location: ["src/utils/race.ts", "src/components/combos/"]
    changes:
      - 位置函數 p(t) = v·t − (v/a)(1 − e^(−a·t)) 為封閉解，每一幀 O(1)
      - 完賽時間以二分搜尋單調函數求解（Binary Search on Answer）
      - 組合間最強／最弱標籤以單次走訪求最大值與次數，O(n·k)，取代 O(n²) 兩兩比較
      - 紅綠燈倒數、速度線與頒獎台
    impact: "組合比較從讀數字變成看比賽"

  - name: "設計系統"
    location: ["src/app/globals.css", "tailwind.config.js", "src/components/ui/"]
    changes:
      - 色彩改為 CSS 變數 token（亮色／深色），Tailwind 以 rgb(var()) 取用
      - 字體：Huninn（標題）、Geist + Noto Sans TC（內文）、Geist Mono（數字）
      - 共用 Button、Segmented、Avatar、Icon 元件
      - 移除全域 transition 與 hover 放大等效果
    impact: "樣式來源單一，元件風格一致"

  - name: "手機體驗與主控台"
    location: ["src/components/browser/EntityBrowser.tsx", "src/components/layout/Sidebar.tsx", "src/providers/JotaiProvider.tsx", "src/components/SpeedInsightsWrapper.tsx"]
    changes:
      - 點選性能卡片或搜尋結果後，焦點區不在畫面上半部時自動捲到焦點區
      - 手機版頂部改為品牌與圖示按鈕同一列，導覽列可橫向捲動，整列固定在畫面頂部（捲動時仍可切換頁面）
      - Jotai DevTools 改為以 NEXT_PUBLIC_JOTAI_DEVTOOLS=true 手動開啟，避免棄用警告
      - Speed Insights 只在正式環境載入，避免開發環境被 CSP 擋下而報錯
      - 新增 favicon（src/app/icon.svg）與 Apple touch icon（src/app/apple-icon.png）
    impact: "手機點選後直接看到結果，開發環境主控台沒有警告與錯誤"

  - name: "README"
    location: ["README.md", "docs/images/"]
    changes:
      - 改為與網站一致的風格：格旗與賽道橫幅（docs/images/banner.svg）、實際畫面截圖、賽道用語的章節
      - 移除過時描述（統計條形圖、平滑過渡、DevTools 自動啟用等）
    impact: "README 與網站外觀、功能一致"

testing:
  - "tests/profile.test.mts：分組與暴力解一致、跑法與強弱項"
  - "tests/race.test.mts：二分搜尋完賽時間與逐步模擬（Oracle）一致、排名正確"
---
