function StatsCard({ title, value }) {
  return (
    <div
      style={{
        background: "#1E293B",
        border: "1px solid #334155",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#94A3B8",
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          marginTop: "10px",
          marginBottom: 0,
          fontSize: "30px",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

export default StatsCard;