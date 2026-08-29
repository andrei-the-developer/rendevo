import { dataBreve, separaNomi } from "@/lib/formato";
import type { Lingua } from "@/lib/lingue";
import type { Busta as TBusta } from "@/lib/tipi";

function Nomi({ titolo, classe }: { titolo: string; classe: string }) {
  const parti = separaNomi(titolo);
  return (
    <p className={classe}>
      {parti.map((parte, i) => (
        <span key={i}>
          {i > 0 && <span className="amp">&amp;</span>}
          <span>{parte}</span>
        </span>
      ))}
    </p>
  );
}

/** La lettera che esce dalla busta. */
export function CartaBusta({
  c,
  titoloFallback,
  lingua = "it",
}: {
  c: TBusta;
  titoloFallback?: string;
  lingua?: Lingua;
}) {
  const titolo = c.titolo.trim() || titoloFallback || "";
  return (
    <div className="lettera">
      <span className="lettera__filo" aria-hidden="true" />
      {c.frase && <p className="lettera__frase etichetta">{c.frase}</p>}
      {titolo && <Nomi titolo={titolo} classe="lettera__nomi" />}
      {c.data && <p className="lettera__data">{dataBreve(c.data, lingua)}</p>}
    </div>
  );
}

/** Il fronte della busta chiusa: nome del destinatario e sigillo di cera.
 *
 * Usato in due contesti: come sipario davanti all'invito dell'ospite (lì è
 * puro decoro, il testo vero arriva dopo l'apertura — `decorativo`
 * nasconde il duplicato agli screen reader) e come blocco in linea
 * nell'editor, dove è contenuto reale e va letto normalmente. */
export function FronteBusta({
  c,
  titoloFallback,
  decorativo = false,
  lingua = "it",
}: {
  c: TBusta;
  titoloFallback?: string;
  decorativo?: boolean;
  lingua?: Lingua;
}) {
  const titolo = c.titolo.trim() || titoloFallback || "";

  return (
    <div className="busta" aria-hidden={decorativo || undefined}>
      {/* La lettera sta dentro e sale quando la busta si apre. */}
      <div className="busta__lettera">
        <CartaBusta c={c} titoloFallback={titoloFallback} lingua={lingua} />
      </div>

      {/* Le tre falde del fronte, ritagliate: danno la V della busta reale. */}
      <span className="busta__lato busta__lato--sx" />
      <span className="busta__lato busta__lato--dx" />
      <span className="busta__fondo" />

      <div className="busta__indirizzo">
        {titolo && <Nomi titolo={titolo} classe="busta__nomi" />}
      </div>

      {/* Il lembo ruota indietro all'apertura; il sigillo si spacca prima. */}
      <span className="busta__lembo" />
      <span className="busta__sigillo">
        {/* Il monogramma A&V impresso nella cera, lo stesso che sta sotto ogni
            titolo di sezione. Prima c'erano le iniziali di chi invita. */}
        <span className="busta__sigillo-simbolo" aria-hidden="true" />
      </span>
    </div>
  );
}
