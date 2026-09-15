/* UNI 자금 폰 사본 — 서비스 워커.

   ★ 껍데기는 담고, 자료는 절대 안 담는다.
     이 둘을 가르는 것이 요점이다. 껍데기(HTML·CSS·JS)에는 숫자가 한 줄도 없으므로
     담아 두면 폰이 잠깐 끊겨도 화면은 뜬다. 그러나 `data.enc` 를 담으면 **어제 잔액을
     오늘 잔액처럼** 보여 주게 된다 — 이 앱에서 제일 위험한 일이고, 본체 앱의 워커가
     아무것도 안 담는 이유와 같다.

   ★ 그래서 자료는 언제나 그물로만 온다. 못 받으면 화면이 그렇게 말한다(빈 화면을
     주지 않는다). 사본이 낡았는지는 화면 맨 위의 '기준시각'이 늘 적는다.
*/
const SHELL = "unicf-snap-shell-v1";
const FILES = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).catch(() => {}));
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== SHELL) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // ★ 자료는 담지도, 담긴 것을 꺼내 주지도 않는다.
  if (url.pathname.endsWith("data.enc")) return;          // 그물로 그대로 나간다
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        // 받은 껍데기는 갱신해 둔다 — 다음에 끊겼을 때 최신 껍데기가 뜬다
        const copy = r.clone();
        caches.open(SHELL).then(c => c.put(e.request, copy)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then(m => m || caches.match("./index.html")))
  );
});
