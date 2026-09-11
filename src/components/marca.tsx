export default function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <div className="marca">
      <span className="marca-simbolo">CC</span>
      <span>
        <span className="marca-nome">Conformidade</span>
        {!compacta && (
          <span className="marca-sub block">Checklists de setor</span>
        )}
      </span>
    </div>
  );
}
