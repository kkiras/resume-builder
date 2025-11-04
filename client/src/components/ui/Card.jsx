export default function Card({ children }) {
    return (
        <div style={cardStyle} >
            {children}
        </div>
    )
}

const cardStyle = {
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white'
}