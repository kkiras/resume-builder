export default function AvaDisplayLeftIcon({ size, color }) {
    const elementSize = size/2

    return (
        <div
            style={{
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center'
            }}
        > 
            <svg
                width={elementSize}
                height={elementSize}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5 7C5 6.44772 5.44772 6 6 6H18C18.5523 6 19 6.44772 19 7C19 7.55228 18.5523 8 18 8H6C5.44772 8 5 7.55228 5 7ZM5 12C5 11.4477 5.44772 11 6 11H18C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H6C5.44772 13 5 12.5523 5 12ZM11 17C11 16.4477 11.4477 16 12 16H18C18.5523 16 19 16.4477 19 17C19 17.5523 18.5523 18 18 18H12C11.4477 18 11 17.5523 11 17Z"
                    fill={color}
                    />{" "}
                </g>
            </svg>

            <svg
                width={elementSize}
                height={elementSize}
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                >
                <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                <g id="SVGRepo_iconCarrier">
                    <path fill={color} d="M8 3a5 5 0 100 10A5 5 0 008 3z" />
                </g>
            </svg>
        </div>


    )
}