export function getFlagUrl(teamName: string | null | undefined): string {
  if (!teamName) return "https://flagcdn.com/un.svg";
  const name = teamName.toLowerCase().trim();
  switch (name) {
    // Favorit
    case "france":
    case "prancis": return "https://flagcdn.com/fr.svg";
    case "spain":
    case "spanyol": return "https://flagcdn.com/es.svg";
    case "argentina": return "https://flagcdn.com/ar.svg";
    case "england":
    case "inggris": return "https://flagcdn.com/gb.svg";
    case "portugal": return "https://flagcdn.com/pt.svg";
    case "brazil":
    case "brasil": return "https://flagcdn.com/br.svg";
    case "netherlands":
    case "belanda": return "https://flagcdn.com/nl.svg";
    case "germany":
    case "jerman": return "https://flagcdn.com/de.svg";

    // Kuat / Dark
    case "uruguay": return "https://flagcdn.com/uy.svg";
    case "united states":
    case "amerika serikat": return "https://flagcdn.com/us.svg";
    case "mexico":
    case "meksiko": return "https://flagcdn.com/mx.svg";
    case "senegal": return "https://flagcdn.com/sn.svg";
    case "colombia":
    case "kolombia": return "https://flagcdn.com/co.svg";
    case "croatia":
    case "kroasia": return "https://flagcdn.com/hr.svg";
    case "belgium":
    case "belgia": return "https://flagcdn.com/be.svg";
    case "morocco":
    case "maroko": return "https://flagcdn.com/ma.svg";

    // Menengah Atas
    case "japan":
    case "jepang": return "https://flagcdn.com/jp.svg";
    case "switzerland":
    case "swiss": return "https://flagcdn.com/ch.svg";
    case "iran": return "https://flagcdn.com/ir.svg";
    case "türkiye":
    case "turkiye":
    case "turki": return "https://flagcdn.com/tr.svg";
    case "ecuador": return "https://flagcdn.com/ec.svg";
    case "austria": return "https://flagcdn.com/at.svg";
    case "australia": return "https://flagcdn.com/au.svg";
    case "south korea":
    case "korea selatan": return "https://flagcdn.com/kr.svg";

    // Menengah
    case "paraguay": return "https://flagcdn.com/py.svg";
    case "sweden":
    case "swedia": return "https://flagcdn.com/se.svg";
    case "côte d'ivoire":
    case "cote d'ivoire":
    case "pantai gading": return "https://flagcdn.com/ci.svg";
    case "panama": return "https://flagcdn.com/pa.svg";
    case "norway":
    case "norwegia": return "https://flagcdn.com/no.svg";
    case "canada": return "https://flagcdn.com/ca.svg";
    case "algeria":
    case "aljazair": return "https://flagcdn.com/dz.svg";
    case "egypt":
    case "mesir": return "https://flagcdn.com/eg.svg";

    // Underdog Kompetitif
    case "czechia":
    case "ceko": return "https://flagcdn.com/cz.svg";
    case "scotland":
    case "skotlandia": return "https://flagcdn.com/gb-sct.svg";
    case "tunisia": return "https://flagcdn.com/tn.svg";
    case "dr congo": return "https://flagcdn.com/cd.svg";
    case "uzbekistan": return "https://flagcdn.com/uz.svg";
    case "qatar": return "https://flagcdn.com/qa.svg";
    case "iraq":
    case "irak": return "https://flagcdn.com/iq.svg";
    case "south africa":
    case "afrika selatan": return "https://flagcdn.com/za.svg";

    // Underdog Berat
    case "new zealand":
    case "selandia baru": return "https://flagcdn.com/nz.svg";
    case "haiti": return "https://flagcdn.com/ht.svg";
    case "curaçao":
    case "curacao": return "https://flagcdn.com/cw.svg";
    case "ghana": return "https://flagcdn.com/gh.svg";
    case "cape verde": return "https://flagcdn.com/cv.svg";
    case "bosnia & herzegovina":
    case "bosnia and herzegovina":
    case "bosnia": return "https://flagcdn.com/ba.svg";
    case "jordan":
    case "yordania": return "https://flagcdn.com/jo.svg";
    case "saudi arabia":
    case "arab saudi": return "https://flagcdn.com/sa.svg";

    default: return "https://flagcdn.com/un.svg";
  }
}
