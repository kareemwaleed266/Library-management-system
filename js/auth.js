// تجديد التوكن باستخدام الـ refresh token المخبأ في الكوكيز
async function refreshAccessToken() {
  try {
    const response = await fetch(
      "https://libraryms.runasp.net/api/Account/refresh-token",
      {
        method: "POST",
        credentials: "include", // لإرسال الكوكيز
      }
    );
    if (!response.ok) throw new Error("Failed to refresh token");
    const data = await response.json();
    localStorage.setItem("accessToken", data.token);
    return true;
  } catch (error) {
    console.error("Refresh token failed:", error);
    alert("Your session has expired. Please log in again.");
    window.location.href = "login.html";
    return false;
  }
}

// دالة عامة لإرسال أي طلب مع التوكن وتجربة التجديد أوتوماتيكياً
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("accessToken");
  options.credentials = "include"; // لإرسال الكوكيز
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };
  let response = await fetch(url, options);
  if (response.status === 401) {
    const ok = await refreshAccessToken();
    if (ok) {
      // جرب مرة ثانية بعد تجديد التوكن
      options.headers.Authorization = `Bearer ${localStorage.getItem(
        "accessToken"
      )}`;
      response = await fetch(url, options);
    }
  }
  return response;
}

// تصدير الدوال للعالمية
window.fetchWithAuth = fetchWithAuth;
window.refreshAccessToken = refreshAccessToken;

// تحديث تلقائي للتوكن كل 5 دقائق
setInterval(() => {
  refreshAccessToken();
}, 60 * 1000);
