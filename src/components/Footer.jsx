import { smoothLink } from '../animations/scrollAnimations'
import { EMAIL } from './Contact'

const LINKS = [
  ['Services', '#services'],
  ['Work', '#work'],
  ['About', '#about'],
  ['Contact', '#contact'],
]

export default function Footer() {
  return (
    <footer className="footer" aria-labelledby="footer-title">
      <div className="wrap footer__inner">
        <div className="footer__top">
          <p className="footer__tagline">
            Digital experiences,
            <br />
            software and stories.
          </p>
          <nav aria-label="Footer">
            <ul className="footer__links">
              {LINKS.map(([label, href]) => (
                <li key={href}>
                  <a href={href} onClick={smoothLink} data-cursor="hover">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="footer__contact">
            <p className="t-label t-muted">Say hello</p>
            <a href={`mailto:${EMAIL}`} data-cursor="cta">
              {EMAIL}
            </a>
          </div>
        </div>

        <p id="footer-title" className="footer__mark" aria-label="ORCADES">
          <span aria-hidden="true">ORCADES</span>
        </p>

        <div className="footer__bottom t-label t-muted">
          <span>© {new Date().getFullYear()} ORCADES</span>
          <a href="#top" onClick={smoothLink} data-cursor="hover">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
