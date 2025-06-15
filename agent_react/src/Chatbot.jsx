// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css'; // 기본 CSS 파일 사용
import { marked } from 'marked'; // marked 라이브러리 import 추가
import Header from './Header';

function Chatbot() {
    const [sessionId, setSessionId] = useState(null);
    const [file, setFile] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [uploadMessage, setUploadMessage] = useState('');
    const [analysisReportReceived, setAnalysisReportReceived] = useState(false); // 분석 보고서 수신 여부
    const [isProcessingFile, setIsProcessingFile] = useState(false); // 파일 처리 중 상태 추가
    const [fileSubmitted, setFileSubmitted] = useState(false); // 파일 제출 여부 (새로운 상태 추가)


    const wsRef = useRef(null); // 웹소켓 객체를 저장할 ref


    const BASE_URL = ""; // <--- Colab 출력의 ngrok URL과 일치하는지 다시 확인!

    // 채팅 스크롤을 최하단으로 자동 이동
    const chatBoxRef = useRef(null);
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [chatHistory]);

    // 세션 초기화 (앱 로드 시 1회)
    useEffect(() => {
        const initialize = async () => {
            try {
                const response = await fetch(`${BASE_URL}/initialize_session/`, { method: 'POST' });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Failed to initialize session. Server responded with:', response.status, response.statusText, errorText);
                    setUploadMessage(`세션 초기화 실패: ${response.status} ${response.statusText}. 서버 응답: ${errorText.substring(0, 100)}...`);
                    return;
                }

                const data = await response.json();

                if (!data || !data.session_id) {
                    console.error('Session ID not received from server:', data);
                    setUploadMessage("세션 ID를 서버로부터 받지 못했습니다. 서버 응답을 확인하세요.");
                    return;
                }

                setSessionId(data.session_id);
                console.log('Session initialized:', data.session_id);

                const wsProtocol = BASE_URL.startsWith('https:') ? 'wss:' : 'ws:';
                const wsHost = BASE_URL.split('//')[1];
                const wsUrl = `${wsProtocol}//${wsHost}/ws/${data.session_id}`;

                wsRef.current = new WebSocket(wsUrl);

                wsRef.current.onopen = () => {
                    console.log('WebSocket connected');
                };

                wsRef.current.onmessage = (event) => {
                    try {
                        const messageData = JSON.parse(event.data);
                        console.log('WebSocket message received:', messageData);

                        if (messageData.type === 'analysis_report') {
                            setChatHistory(prev => [...prev, ['🤖 AI 변호사', messageData.message]]);
                            setAnalysisReportReceived(true); // 보고서 수신 완료
                            setUploadMessage("✅ 파일 분석이 완료되었습니다. 보고서가 채팅창에 표시됩니다.");
                            setIsProcessingFile(false); // 파일 처리 완료
                        } else if (messageData.type === 'error') {
                            setChatHistory(prev => [...prev, ['🚨 오류', messageData.message]]);
                            console.error('Server error:', messageData.message);
                            setUploadMessage(`서버 오류: ${messageData.message}`);
                            setIsProcessingFile(false); // 오류 발생 시 처리 중지
                            // 오류 발생 시에도 파일 제출 섹션을 다시 보이게 할지 결정 (현재는 유지)
                            // setFileSubmitted(false); // 오류 시 다시 파일 업로드 가능하도록
                        } else if (messageData.type === 'info') {
                            setUploadMessage(messageData.message);
                            setChatHistory(prev => [...prev, ['💬 시스템 알림', messageData.message]]);
                        } else {
                            console.warn('Received unexpected WebSocket message type:', messageData.type, messageData);
                        }
                    } catch (e) {
                        console.error('Error parsing WebSocket message:', e, event.data);
                        setUploadMessage(`웹소켓 메시지 파싱 오류: ${event.data}`);
                        setIsProcessingFile(false);
                        // setFileSubmitted(false); // 오류 시 다시 파일 업로드 가능하도록
                    }
                };

                wsRef.current.onclose = (event) => {
                    console.log('WebSocket disconnected:', event.code, event.reason);
                    if (!analysisReportReceived) {
                        setUploadMessage("웹소켓 연결이 끊겼습니다. 백엔드 서버를 확인해주세요.");
                    }
                    setIsProcessingFile(false);
                    // setFileSubmitted(false); // 연결 끊김 시에도 다시 파일 업로드 가능하도록
                };

                wsRef.current.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    setUploadMessage("세션 초기화 중 웹소켓 연결에 실패했습니다. 백엔드 서버가 실행 중인지, ngrok URL이 올바른지 확인해주세요.");
                    setIsProcessingFile(false);
                    // setFileSubmitted(false); // 오류 시 다시 파일 업로드 가능하도록
                };

            } catch (error) {
                console.error('Error initializing session (fetch error):', error);
                setUploadMessage("세션 초기화에 실패했습니다. 백엔드 서버가 실행 중인지, ngrok URL이 올바른지 확인해주세요.");
            }
        };
        initialize();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const handleFileUpload = async () => {
        if (!file) {
            setUploadMessage("📝 파일을 업로드해주세요.");
            return;
        }
        if (!sessionId) {
            setUploadMessage("세션이 아직 초기화되지 않았습니다. 잠시 기다려주세요.");
            return;
        }
        if (isProcessingFile) {
            setUploadMessage("파일 처리 중입니다. 잠시 기다려주세요.");
            return;
        }

        setIsProcessingFile(true); // 파일 처리 시작
        setUploadMessage("파일 업로드 중...");
        setChatHistory([]); // 새 파일 업로드 시 이전 채팅 기록 초기화
        setAnalysisReportReceived(false); // 보고서 수신 상태 초기화
        setFileSubmitted(true); // 파일 제출 시작 시 제출 섹션 숨김


        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${BASE_URL}/upload_and_analyze/?session_id=${sessionId}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: '알 수 없는 오류' }));
                throw new Error(errorData.detail || '파일 업로드 실패');
            }

            const data = await response.json();
            setUploadMessage(data.message || "파일 업로드 및 분석 요청 완료. 분석 보고서를 기다리는 중...");

        } catch (error) {
            console.error('Error uploading file:', error);
            if (error instanceof SyntaxError) {
                setUploadMessage(`파일 업로드 응답 오류: 서버 응답이 JSON이 아닙니다. (개발자 도구 콘솔 확인)`);
            } else {
                setUploadMessage("파일 업로드 중 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
            }
            setIsProcessingFile(false);
            setFileSubmitted(false); // 오류 발생 시 파일 제출 섹션 다시 보이게
        }
    };

    // 마크다운 렌더링을 위한 함수
    const renderMarkdown = (markdownText) => {
        // marked 라이브러리가 전역에 로드되어 있거나 import 되어 있어야 함
        return <div dangerouslySetInnerHTML={{ __html: marked.parse(markdownText) }} />;
    };

    return (
        <div className="container">
            <Header></Header>
            <h1 className="main-title">🎙️ AI 전세사기 위험 분석 시스템</h1>
            <p className="main-description">전세 계약 관련 자료를 업로드하시면, AI 변호사가 위험을 분석하고 보고서를 제공합니다.</p>

            {/* fileSubmitted 상태에 따라 파일 업로드 섹션을 조건부 렌더링 */}
            {!fileSubmitted && (
                <div className="file-upload-section">
                    <div className="input-group">
                        <input
                            type="file"
                            id="fileInput"
                            accept=".pdf,.docx"
                            onChange={(e) => setFile(e.target.files[0])}
                            disabled={isProcessingFile}
                        />
                        <button
                            onClick={handleFileUpload}
                            disabled={!file || isProcessingFile || !sessionId}
                        >
                            {isProcessingFile ? '분석 중...' : '🚀 분석 시작'}
                        </button>
                    </div>
                    {uploadMessage && <p className="status-message">{uploadMessage}</p>}
                </div>
            )}

            {/* analysisReportReceived 상태 또는 fileSubmitted (분석 시작) 상태에 따라 채팅 섹션 표시 */}
            {/* 분석 보고서를 기다리는 중에도 채팅 섹션(시스템 알림)을 보여주기 위해 조건 변경 */}
            {(fileSubmitted || analysisReportReceived) && (
                <div className="chat-section">
                    <h2 className="section-subtitle">📊 분석 보고서</h2>
                    <div id="chatBox" className="chat-box" ref={chatBoxRef}>
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`message ${msg[0] === '🙋‍♂️ 사용자' ? 'user-message' : 'ai-message'}`}>
                                {renderMarkdown(msg[1])} {/* marked.parse 대신 renderMarkdown 함수 사용 */}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Chatbot;
