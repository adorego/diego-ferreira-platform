export default function AvanzaCanceladoPage() {
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
        <h1 style={{ fontSize: '24px', color: '#ffffff', marginBottom: '1rem', fontWeight: 800 }}>
          Pago cancelado
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', marginBottom: '2rem', lineHeight: 1.6 }}>
          Cancelaste el proceso de pago. Podés intentarlo de nuevo cuando quieras.
        </p>
        <a
          href="/avanza#comprar"
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
          Intentar de nuevo
        </a>
      </div>
    </div>
  )
}
