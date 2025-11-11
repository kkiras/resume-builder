// OneTapButton.jsx
import { useRef } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Button } from "rsuite";
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../../utils/apiBase";

export default function GoogleOneTapButton() {
  const initialized = useRef(false);
  const navigate = useNavigate();

  const triggerOneTap = () => {
    const g = window.google?.accounts?.id;
    if (!g) return console.error("Google Identity Services chưa sẵn sàng");

    if (!initialized.current) {
      g.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (res) => {
          try {
            const payload = jwtDecode(res.credential);     // thông tin user
            const response = await axios.post(`${API_BASE_URL}/api/auth/google`, { 
                token: res.credential 
            }); // verify ở server
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            // Set default Authorization header for subsequent requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            console.log("Login OK:", payload);
            // Navigate similar to Login.jsx
            navigate('/dashboard/resumes');
          } catch (e) {
            console.error("Xử lý token lỗi:", e);
          }
        },
        ux_mode: "popup",
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      initialized.current = true;
    }

    // Hiển thị One Tap prompt khi người dùng bấm nút
    g.prompt((notification) => {
      // Nếu One Tap không hiển thị (VD: chặn cookie bên thứ ba), có thể fallback tại đây
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.warn("One Tap không hiển thị, hãy hiển thị nút đăng nhập Google fallback.");
      }
    });
  };

  return (
    <Button onClick={triggerOneTap}>
      Login with Google
    </Button>
  );
}
