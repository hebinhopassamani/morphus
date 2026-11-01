import { Component } from '@angular/core';

@Component({
  selector: 'admin-welcome',
  template: `
    <div class="flex flex-auto flex-col p-8">
      <div class="flex-auto rounded-md border-2 border-dashed p-8 md:p-12">
        <article class="prose w-full max-w-3xl">
          <h1>BuilderKit Spark</h1>
          <p class="lead">This template is empty on purpose</p>
          <p>
            What you’re seeing right now is a clean, production-ready foundation
            designed to help you build
            <strong>any kind of Angular application</strong> without bloat. It
            doesn’t come with any pages or pre-built features except the bare
            minimum you need to get started.
          </p>

          <h3>What’s included:</h3>
          <ul>
            <li>
              <p>Empty Angular project with BuilderKit and TailwindCSS</p>
            </li>
            <li>
              <p>
                Smart & reusable services like <strong>Theming</strong> and
                <strong>LocalStorage</strong>
              </p>
            </li>
            <li>
              <p>Ready to be structured in any way you want</p>
            </li>
            <li>
              <p>Full SSR support</p>
            </li>
          </ul>

          <p class="mt-10">
            You’re looking at the same template used to build
            <strong>builderkit.dev</strong>. If you need more than a blank
            template, check out
            <a
              href="https://builderkit.dev?utm_source=spark&utm_medium=welcome-page"
              target="_blank"
              rel="noopener noreferrer"
              >Builderkit</a
            >
            for more.
          </p>
        </article>
      </div>
    </div>
  `,
})
export default class AdminWelcome {}
