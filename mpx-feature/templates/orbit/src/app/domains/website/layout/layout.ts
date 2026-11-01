import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'web-layout',
  imports: [RouterOutlet, MatButton, MatIcon, RouterLink],
  template: `
    <!-- Header -->
    <header
      class="sticky top-0 z-99 border-b bg-white-a9 backdrop-blur-xl dark:bg-neutral-a1"
    >
      <!-- Container -->
      <div
        class="@container mx-auto flex w-full max-w-7xl items-center gap-x-12 px-6 py-5 lg:px-8"
      >
        <!-- Logo -->
        <a
          class="flex items-center gap-x-2"
          routerLink="/"
        >
          <mat-icon
            svgIcon="orbit"
            class="size-6 text-neutral-a12"
          />
          <div class="font-mono text-3xl font-semibold tracking-widest">
            ORBIT
          </div>
        </a>

        <!-- Menu -->
        <div
          class="flex items-center gap-x-8 text-lg *:underline-offset-2 *:hover:underline"
        >
          <a routerLink="/">Overview</a>
          <a routerLink="/pricing">Pricing</a>
          <a routerLink="/about">About</a>
        </div>

        <!-- Spacer -->
        <div class="flex-auto"></div>

        <!-- Actions -->
        <div class="flex items-center gap-x-3">
          <button
            matButton
            class="tiny tertiary"
          >
            Sign in
          </button>

          <button
            matButton
            class="primary tiny"
          >
            Get started
          </button>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="flex flex-auto flex-col">
      <router-outlet />
    </main>

    <!-- Footer -->
    <footer class="mt-10 border-t lg:mt-16">
      <!-- Container -->
      <div
        class="@container mx-auto w-full max-w-3xl px-6 py-10 lg:max-w-7xl lg:px-8 lg:py-16"
      >
        <div
          class="grid w-full grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-6"
        >
          <!-- Logo -->
          <div class="flex flex-col gap-y-3 sm:col-span-2">
            <a
              class="flex items-center gap-x-2"
              routerLink="/"
            >
              <mat-icon
                svgIcon="orbit"
                class="size-6 text-neutral-a12"
              />
              <div class="font-mono text-3xl font-semibold tracking-widest">
                ORBIT
              </div>
            </a>
          </div>

          <!-- Product menu -->
          <div class="flex flex-col gap-y-4">
            <div class="text-lg/6 font-semibold">Product</div>
            <div
              class="flex flex-col gap-y-3 *:underline-offset-2 *:hover:underline"
            >
              <a
                routerLink="."
                class="text-lg"
                >Changelog</a
              >
              <a
                routerLink="."
                class="text-lg"
                >Roadmap</a
              >
              <a
                routerLink="."
                class="text-lg"
                >FAQ</a
              >
              <a
                routerLink="."
                class="text-lg"
                >Documentation</a
              >
            </div>
          </div>

          <!-- Company menu -->
          <div class="flex flex-col gap-y-4">
            <div class="text-lg/6 font-semibold">Company</div>
            <div
              class="flex flex-col gap-y-3 *:underline-offset-2 *:hover:underline"
            >
              <a
                routerLink="."
                class="text-lg"
                >About</a
              >
              <a
                routerLink="."
                class="text-lg"
                >Careers</a
              >
              <a
                routerLink="."
                class="text-lg"
                >Press</a
              >
              <a
                routerLink="."
                class="text-lg"
                >Contact</a
              >
            </div>
          </div>

          <!-- Legal menu -->
          <div class="flex flex-col gap-y-4">
            <div class="text-lg/6 font-semibold">Legal</div>
            <div
              class="flex flex-col gap-y-3 *:underline-offset-2 *:hover:underline"
            >
              <a
                routerLink="."
                class="text-lg"
                >Privacy</a
              >
              <a
                routerLink="."
                class="text-lg"
                >Terms of Service</a
              >
              <a
                routerLink="."
                class="text-lg"
                >Cookie Policy</a
              >
              <a
                routerLink="."
                class="text-lg"
                >License</a
              >
            </div>
          </div>

          <!-- Connect menu -->
          <div class="flex flex-col gap-y-4">
            <div class="text-lg/6 font-semibold">Connect</div>
            <div
              class="flex flex-col gap-y-3 *:underline-offset-2 *:hover:underline"
            >
              <a
                routerLink="."
                class="text-lg"
                >GitHub</a
              >
              <a
                routerLink="."
                class="text-lg"
                >X</a
              >
              <a
                routerLink="."
                class="text-lg"
                >Discord</a
              >
              <a
                routerLink="."
                class="text-lg"
                >LinkedIn</a
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Container -->
      <div class="border-t">
        <div class="@container mx-auto w-full max-w-3xl px-6 py-5 lg:max-w-7xl">
          <div class="flex items-center justify-between gap-x-4">
            <div class="">
              Copyright © {{ year() }} Orbit. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class WebLayout {
  // State
  private readonly year = () => new Date().getFullYear();
}
