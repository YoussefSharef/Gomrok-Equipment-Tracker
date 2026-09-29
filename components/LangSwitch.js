import { setLang } from '@/app/actions';
export default function LangSwitch({ lang, label, className = 'lang-btn' }) {
  const other = lang === 'ar' ? 'en' : 'ar';
  return (
    <form action={setLang}>
      <input type="hidden" name="lang" value={other} />
      <button type="submit" className={className} lang={other}>
        <span className={other === 'ar' ? 'ar-font' : 'en-font'}>{label}</span>
      </button>
    </form>
  );
}
