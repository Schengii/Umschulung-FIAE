export const WEB_COMPONENTS_DATA = [
  {
    id: 'lit',
    name: 'Lit.dev (LitElement)',
    badge: 'Lightweight & Ultra-Fast',
    icon: '🔥',
    desc: 'Offizielle Google-Bibliothek für schnelle, leichtgewichtige Web Components mit reactive State & Scoped Styles.',
    exampleCode: `import { LitElement, html, css } from 'lit';

export class MyElement extends LitElement {
  static styles = css\`p { color: #4f46e5; font-weight: bold; }\`;
  static properties = { name: { type: String } };

  constructor() {
    super();
    this.name = 'World';
  }

  render() {
    return html\`<p>Hello, \${this.name}!</p>\`;
  }
}
customElements.define('my-element', MyElement);`
  },
  {
    id: 'vaadin',
    name: 'Vaadin Web Framework',
    badge: 'Java & Web Components',
    icon: '🌱',
    desc: 'Enterprise Web Framework zum Erstellen von modernen UIs in Java & Web Components ohne JavaScript-Overhead.',
    exampleCode: `// Vaadin Java UI Component
@Route("")
public class MainView extends VerticalLayout {
    public MainView() {
        TextField nameField = new TextField("Dein Name");
        Button button = new Button("Absenden", e -> 
            Notification.show("Hallo " + nameField.getValue()));
        add(nameField, button);
    }
}`
  },
  {
    id: 'native_wc',
    name: 'Native HTML5 Web Components',
    badge: 'W3C Browser Standard',
    icon: '🌐',
    desc: 'Verwende Custom Elements, Shadow DOM und HTML Templates nativ im Browser ohne Framework-Abhängigkeiten.',
    exampleCode: `class CustomButton extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = \`<button style="background: #0d9488; color: white; border: none; padding: 10px 20px; border-radius: 8px;">\${this.textContent}</button>\`;
  }
}
customElements.define('custom-button', CustomButton);`
  }
];
