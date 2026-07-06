import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 1. Axios 인스턴스 생성
const axiosInstance = axios.create({
  // 백엔드 서버 주소로 설정
  baseURL: 'http://localhost:8080', 
  // 다른 도메인으로 쿠키를 전송하기 위한 설정 (Refresh Token)
  withCredentials: true, 
});

// 2. 요청 인터셉터 (Request Interceptor)
axiosInstance.interceptors.request.use(
  (config) => {
    // sessionStorage에서 access token을 가져옵니다.
    const accessToken = sessionStorage.getItem('accessToken');
    
    // access token이 존재하면 요청 헤더에 추가합니다.
    if (accessToken) {
      config.headers['access'] = accessToken;
    }
    return config;
  },
  (error) => {
    // 요청 설정 중 에러 발생 시 처리
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// 3. 응답 인터셉터 (Response Interceptor)
// Access Token 만료 시, 자동으로 재발급을 시도하는 로직을 추가할 수 있습니다.
// (이 부분은 선택적이지만, 사용자 경험을 크게 향상시킵니다.)
axiosInstance.interceptors.response.use(
  (response) => {
    // 정상 응답은 그대로 반환
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized 에러이고, 재시도한 요청이 아닐 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 재시도 플래그 설정

      try {
        // Refresh Token으로 새로운 Access Token 재발급 요청
        const reissueResponse = await axiosInstance.post('/reissue');
        
        // 재발급 성공 시
        const newAccessToken = reissueResponse.headers['access'];
        if (newAccessToken) {
          console.log("Access Token 재발급 성공!");
          sessionStorage.setItem('accessToken', newAccessToken);

          // 원래 요청의 헤더에 새로운 토큰을 설정하여 재요청
          originalRequest.headers['access'] = newAccessToken;
          return axiosInstance(originalRequest);
        }
      }catch (reissueError) {
        // Refresh Token도 만료되었거나, 재발급 실패 시
        console.error("토큰 재발급 실패:", reissueError);
        sessionStorage.removeItem('accessToken'); // 기존 토큰 삭제
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        // ✅ 수정 제안: 현재 경로에 따라 이동 오류가 발생하지 않도록 절대 경로로 변경
        window.location.href = '/user/login'; 
        return Promise.reject(reissueError);
      }
    }
    
    // 그 외 다른 에러들은 그대로 반환
    return Promise.reject(error);
  }
);

export default axiosInstance;