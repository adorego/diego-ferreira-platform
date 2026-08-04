export default function AvanzaConfirmacionPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#080808',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: '480px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📖</div>
        <h1 style={{ fontSize: '24px', color: '#ffffff', marginBottom: '1rem', fontWeight: 800 }}>
          ¡Gracias por tu compra!
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', marginBottom: '2rem', lineHeight: 1.6 }}>
          Recibirás el link de descarga en tu email en los próximos minutos.
        </p>
        <a
          href="/"
          style={{
            display:         'inline-block',
            backgroundColor: '#EBBF01',
            color:           '#0a0a0a',
            fontWeight:      700,
            padding:         '0.75rem 1.75rem',
            borderRadius:    '50px',
            textDecoration:  'none',
            fontSize:        '15px',
          }}
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )
}
