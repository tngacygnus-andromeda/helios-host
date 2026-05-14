// mother-screen/src/App.js
import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import io from 'socket.io-client';
import marsMapImage from './mars-map.png';
import './App.css';

const socket = io('https://3a61-112-197-49-69.ngrok-free.app', {
  extraHeaders: {
    "ngrok-skip-browser-warning": "true"
  }
});

function App() {
  const [question, setQuestion] = useState(null);
  const [timer, setTimer] = useState(0);
  const [leaderboard, setLeaderboard] = useState({});
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    socket.on('new_question', (q) => {
      setQuestion(q);
    });

    socket.on('timer_tick', (t) => {
      setTimer(t);
    });

    socket.on('update_leaderboard', (scores) => {
      setLeaderboard(scores);
    });

    socket.on('action_log', (log) => {
      setLogs((prev) => [log, ...prev].slice(0, 8));
    });

    // Lắng nghe lệnh reset từ chính server dội về để dọn dẹp UI
    socket.on('game_reset', () => {
      setQuestion(null);
      setTimer(0);
      setLeaderboard({});
      setLogs(["[HỆ THỐNG] ⚠️ TOÀN BỘ DỮ LIỆU ĐÃ BỊ XÓA. CHUẨN BỊ ĐÓN NHÓM MỚI!"]);
    });

    return () => {
      socket.off('new_question');
      socket.off('timer_tick');
      socket.off('update_leaderboard');
      socket.off('action_log');
      socket.off('game_reset');
    };
  }, []);

  const triggerNext = () => {
    socket.emit('next_question');
  };

  const triggerReset = () => {
    // Xác nhận 2 lớp để chống bấm nhầm
    if (window.confirm("⚠️ CẢNH BÁO: Hành động này sẽ XÓA TOÀN BỘ ĐIỂM SỐ của nhóm hiện tại. Bạn có chắc chắn?")) {
      socket.emit('reset_game');
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#0a0a0a',
        color: '#00ff00',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'monospace'
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #00ff00',
          paddingBottom: '10px'
        }}
      >
        <h1
          style={{
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
        >
          🛰️ HELIOS Mission Control
        </h1>

        <div>
          <button
            onClick={triggerReset}
            style={{
              background: '#e74c3c',
              color: '#fff',
              padding: '10px 20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none',
              marginRight: '10px'
            }}
          >
            SYSTEM RESET ⚠️
          </button>
          <button
            onClick={triggerNext}
            style={{
              background: '#00ff00',
              color: '#000',
              padding: '10px 20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            INITIATE NEXT SEQUENCE 🚀
          </button>
        </div>
      </header>

      {/* MAIN */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginTop: '20px'
        }}
      >
        {/* LEFT PANEL */}
        <div
          style={{
            flex: 2,
            border: '1px solid #333',
            padding: '20px',
            borderRadius: '5px',
            position: 'relative'
          }}
        >
          {/* TIMER */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 20,
              fontSize: '3rem',
              color: timer <= 5 ? '#e74c3c' : '#00ff00'
            }}
          >
            T-{timer}s
          </div>

          <h2>TRANSMISSION RECEIVED:</h2>

          {question ? (
            <div>
              {/* QUESTION TEXT */}
              <p
                style={{
                  fontSize: '1.5rem',
                  lineHeight: '1.5'
                }}
              >
                {question.question_text}
              </p>

              {/* MCQ */}
              {question.type === "MCQ" && (
                <div style={{ marginTop: '20px' }}>
                  {Object.entries(question.options).map(([key, value]) => (
                    <div
                      key={key}
                      style={{
                        padding: '10px',
                        marginBottom: '10px',
                        background: '#111',
                        borderLeft: '5px solid #00ff00'
                      }}
                    >
                      <strong>{key}:</strong> {value}
                    </div>
                  ))}
                </div>
              )}

              {/* FRQ */}
              {question.type === "FRQ" && (
                <p
                  style={{
                    color: '#f1c40f',
                    fontStyle: 'italic',
                    marginTop: '20px'
                  }}
                >
                  * Yêu cầu nhập chuỗi dữ liệu (tự luận) *
                </p>
              )}

              {/* SLIDER */}
              {question.type === "INTERACT_SLIDER" && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '20px',
                    background: 'linear-gradient(90deg, red 0%, yellow 50%, blue 100%)',
                    borderRadius: '5px',
                    textAlign: 'center',
                    color: '#000',
                    fontWeight: 'bold'
                  }}
                >
                  <p>QUANG PHỔ THAM CHIẾU</p>
                  <p>HÃY ĐIỀU KHIỂN THIẾT BỊ ĐỂ KHỚP TÍN HIỆU</p>
                </div>
              )}

              {/* SPATIAL - SAO HỎA */}
              {question.type === "INTERACT_SPATIAL" && (
                <div style={{ marginTop: '20px', position: 'relative', width: '100%', maxWidth: '600px', marginInline: 'auto', border: '1px solid #00ff00' }}>
                  {/* Sử dụng biến ảnh đã import */}
                  <img src={marsMapImage} alt="Mars Map" style={{ width: '100%', display: 'block' }} />
                  <p style={{ color: '#f1c40f', textAlign: 'center', marginTop: '10px' }}>* Mục tiêu: Khóa tâm Siêu núi lửa Olympus Mons *</p>
                </div>
              )}

              {/* LORENTZ SHIELD (Thay thế cho PLOT cũ) */}
              {question.type === "INTERACT_LORENTZ" && (
                <div style={{ marginTop: '20px', background: '#111', padding: '20px', borderRadius: '5px', border: '1px dashed #3498db' }}>
                  <h3 style={{color: '#3498db', textAlign: 'center'}}>MÔ PHỎNG LỰC LORENTZ BẺ CONG QUỸ ĐẠO R = (mv)/(qB)</h3>
                  <LineChart width={500} height={300} data={[
                      { B: 1, R: 100 }, { B: 2, R: 50 }, { B: 3, R: 33 }, { B: 4, R: 25 }, { B: 5, R: 20 }, { B: 6, R: 16 }
                    ]} style={{margin: '0 auto'}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="B" label={{ value: 'Từ trường B (Tesla)', position: 'insideBottomRight', offset: -5, fill: '#00ff00' }} stroke="#00ff00" />
                    <YAxis label={{ value: 'Bán kính cong R', angle: -90, position: 'insideLeft', fill: '#00ff00' }} stroke="#00ff00" />
                    <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#3498db'}}/>
                    <Line type="monotone" dataKey="R" stroke="#3498db" strokeWidth={4} dot={{ r: 6, fill: '#e74c3c' }} />
                  </LineChart>
                  <p style={{ color: '#fff', textAlign: 'center' }}>Vùng an toàn để né Trạm không gian: Biên độ bán kính R ~ 22. Tinh chỉnh trên thiết bị của bạn!</p>
                </div>
              )}
            </div>
          ) : (
            <p>Đang chờ lệnh khởi động từ chỉ huy...</p>
          )}

          {/* LOGS */}
          <div
            style={{
              marginTop: '40px',
              borderTop: '1px dotted #333',
              paddingTop: '20px'
            }}
          >
            <h3>📡 LIVE TELEMETRY FEED</h3>
            <ul
              style={{
                listStyleType: 'none',
                padding: 0
              }}
            >
              {logs.map((log, i) => (
                <li
                  key={i}
                  style={{
                    opacity: 1 - i * 0.1
                  }}
                >
                  {log}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          style={{
            flex: 1,
            border: '1px solid #333',
            padding: '20px',
            borderRadius: '5px'
          }}
        >
          <h2>🏆 SQUAD RANKINGS</h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {Object.entries(leaderboard)
              .sort(([, a], [, b]) => b - a)
              .map(([team, score], index) => (
                <div
                  key={team}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px',
                    background: '#111',
                    borderLeft: index === 0 ? '5px solid #f1c40f' : '5px solid #333'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>
                    {index + 1}. {team}
                  </span>
                  <span
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {score} PTS
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;