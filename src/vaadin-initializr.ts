import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@vaadin/radio-group";
import "@vaadin/button";
import { color, typography } from "@vaadin/vaadin-lumo-styles/all-imports.js";

const style = document.createElement("style");
style.innerHTML = `${color.toString()} ${typography.toString()}`;

document.head.appendChild(style);

@customElement("vaadin-initializr")
export class VaadinInitializr extends LitElement {
  javaVersions = [19, 17, 11, 8];
  vaadinVersions = [
    { label: "24", value: "24" },
    { label: "23", value: "23" },
    { label: "14 (previous LTS)", value: "14" }
  ];
  architectures = [
    { label: "Spring Boot", value: "springboot" },
    { label: "Quarkus", value: "quarkus" },
    { label: "Jakarta EE", value: "jee" },
    { label: "Servlet", value: "servlet" },
    { label: "OSGi", value: "osgi" },
    { label: "Karaf", value: "karaf" }
  ];
  support = [
    {
      vaadin: "14",
      language: ["java"],
      build: ["maven", "gradle"],
      arch: ["springboot", "jee", "servlet", "osgi"],
      javaMin: "8"
    },
    {
      vaadin: "23",
      language: ["java"],
      build: ["maven", "gradle"],
      arch: ["springboot", "quarkus", "jee", "servlet", "osgi", "karaf"],
      javaMin: "11"
    },
    {
      vaadin: "24",
      language: ["java", "kotlin"],
      build: ["maven", "gradle"],
      arch: ["springboot", "quarkus", "jee", "servlet"],
      javaMin: "17"
    }
  ];

  downloadLinks = new Map([
    ["kotlin", "https://github.com/mvysny/skeleton-starter-kotlin-spring/archive/master.zip"],
    ["gradle-servlet", "https://github.com/vaadin/base-starter-gradle/archive/v<version>.zip"],
    ["gradle-springboot", "https://github.com/vaadin/base-starter-spring-gradle/archive/v<version>.zip"],
    ["springboot", "https://github.com/vaadin/skeleton-starter-flow-spring/archive/v<version>.zip"],
    ["quarkus", "https://github.com/vaadin/base-starter-flow-quarkus/archive/v<version>.zip"],
    ["jee", "https://github.com/vaadin/skeleton-starter-flow-cdi/archive/v<version>.zip"],
    ["servlet", "https://github.com/vaadin/skeleton-starter-flow/archive/v<version>.zip"],
    ["osgi", "https://github.com/vaadin/base-starter-flow-osgi/archive/v<version>.zip"],
    ["karaf", "https://github.com/vaadin/vaadin-flow-karaf-example/archive/v<version>.zip"]
  ]);

  @state()
  config = {
    language: "java",
    build: "maven",
    arch: "springboot",
    java: "17",
    vaadin: "24"
  };

  getSupportFor(vaadinVersion: number) {
    return this.support.find((s) => s.vaadin === vaadinVersion.toString());
  }

  getJavaMin(vaadinVersion: number) {
    return this.getSupportFor(vaadinVersion)?.javaMin;
  }

  isSupportedVaadinVersion(vaadinVersion: number) {
    const support = this.getSupportFor(vaadinVersion);
    if (!support) return false;
    return parseInt(this.config.java) >= parseInt(support.javaMin) && support.arch.includes(this.config.arch);
  }

  isSupportedJavaVersion(javaVersion: number) {
    return this.support.some((s) => javaVersion >= parseInt(s.javaMin) && s.vaadin === this.config.vaadin);
  }

  isArchSupported(arch: string) {
    const support = this.getSupportFor(parseInt(this.config.vaadin));
    if (!support) return false;
    if (this.config.build === "gradle") {
      return support.arch.includes(arch) && ["springboot", "servlet"].includes(arch);
    } else if (this.config.language === "kotlin") {
      return arch === "springboot";
    } else {
      return support.arch.includes(arch);
    }
  }

  isBuildSupported(build: string) {
    const support = this.getSupportFor(parseInt(this.config.vaadin));
    if (!support) return false;
    if (this.config.language === "kotlin") {
      return support.build.includes(build) && build === "maven";
    }
    return support.build.includes(build);
  }

  isLanguageSupported(language: string) {
    const support = this.getSupportFor(parseInt(this.config.vaadin));
    if (!support) return false;
    return support.language.includes(language);
  }

  currentVaadinVersionHasUnsupportedArch() {
    const support = this.getSupportFor(parseInt(this.config.vaadin));
    if (!support) return false;
    return this.architectures.some((a) => !support.arch.includes(a.value));
  }


  getDownloadLink() {
    let key = "";
    if (this.config.language === "kotlin") key = "kotlin";
    else if (this.config.build === "gradle") {
      key = "gradle-" + this.config.arch;
    } else key = this.config.arch;

    console.log("key: " + key);

    const link = this.downloadLinks.get(key) || "#";
    return link.replace("<version>", this.config.vaadin);
  }

  updateValue(property: string, value: string) {
    //@ts-ignore
    this.config = {
      ...this.config,
      [property]: value
    };

    if(!this.isLanguageSupported(this.config.language)) {
      this.config.language = "java";
    }
    if(!this.isBuildSupported(this.config.build)) {
      this.config.build = "maven";
    }
  }

  protected render() {
    return html`
      <div class="flex flex-col items-start gap-6 p-6">
        <h1 class="text-3xl mb-2 font-bold">Vaadin Initializr</h1>

        <div>
          <h2 class="text-lg">Vaadin Flow version</h2>
          <vaadin-radio-group
            .value=${this.config.vaadin}
            @value-changed="${(e: CustomEvent) => this.updateValue("vaadin", e.detail.value)}">
            ${this.vaadinVersions.map(
              (vaadinVersion) => html`
                <vaadin-radio-button
                  label=${vaadinVersion.label}
                  value=${vaadinVersion.value}
                  ?disabled=${!this.isSupportedVaadinVersion(parseInt(vaadinVersion.value))}></vaadin-radio-button>
              `
            )}
          </vaadin-radio-group>
        </div>
        <div class="flex gap-8">
          <div>
            <h2 class="text-lg">Language</h2>
            <vaadin-radio-group
              .value="${this.config.language}"
              @value-changed="${(e: CustomEvent) => this.updateValue("language", e.detail.value)}">
              <vaadin-radio-button
                label="Java"
                value="java"
                ?disabled="${!this.isLanguageSupported("java")}"></vaadin-radio-button>
              <vaadin-radio-button
                label="Kotlin"
                value="kotlin"
                ?disabled="${!this.isLanguageSupported("kotlin")}"></vaadin-radio-button>
            </vaadin-radio-group>
            <div>
              ${this.isLanguageSupported(this.config.language)
                ? ""
                : html`
                  <span class="text-sm">
                        Vaadin Flow ${this.config.vaadin} does not support ${this.config.language}
                      </span>
                `}
              ${this.config.language === "kotlin" ? html`
              <span class="text-sm">Kotlin support uses a community add-on.</span>` : ""}
            </div>
          </div>
          <div>
            <h2 class="text-lg">Build tool</h2>
            <vaadin-radio-group
              .value="${this.config.build}"
              @value-changed="${(e: CustomEvent) => this.updateValue("build", e.detail.value)}">
              <vaadin-radio-button
                label="Maven"
                value="maven"
                ?disabled="${!this.isBuildSupported("maven")}"></vaadin-radio-button>
              <vaadin-radio-button
                label="Gradle"
                value="gradle"
                ?disabled="${!this.isBuildSupported("gradle")}"></vaadin-radio-button>
            </vaadin-radio-group>
          </div>
        </div>

        <div>
          <h2 class="text-lg">Architecture</h2>
          <vaadin-radio-group
            .value="${this.config.arch}"
            @value-changed="${(e: CustomEvent) => this.updateValue("arch", e.detail.value)}">
            ${this.architectures.map(
              (architecture) => html`
                <vaadin-radio-button
                  label=${architecture.label}
                  value=${architecture.value}
                  ?disabled=${!this.isArchSupported(architecture.value)}></vaadin-radio-button>
              `
            )}
          </vaadin-radio-group>

          ${this.currentVaadinVersionHasUnsupportedArch()
            ? html`<p class="text-sm">Vaadin Flow ${this.config.vaadin} does not support all architectures.</p>`
            : html`<p class="text-sm">&nbsp;</p>`}
        </div>

        <div class="flex gap-6 mt-6 items-baseline">
          <a href="${this.getDownloadLink()}" download>
            <vaadin-button theme="primary">Download starter</vaadin-button>
          </a>
        </div>
        <pre>${this.getDownloadLink()}</pre>
      </div>

    `;
  }

  protected createRenderRoot() {
    return this;
  }
}