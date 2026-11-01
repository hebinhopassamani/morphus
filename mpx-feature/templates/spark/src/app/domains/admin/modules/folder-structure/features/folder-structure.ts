import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';

type Dir = {
  name: string;
  children?: Dir[];
  expanded?: boolean;
};

@Component({
  selector: 'admin-folder-structure',
  imports: [MatButtonModule, MatIconModule, MatTreeModule],
  template: `
    <div class="flex flex-auto flex-col p-8">
      <div class="flex-auto rounded-md border-2 border-dashed p-8 md:p-12">
        <div class="w-full max-w-3xl">
          <article class="prose">
            <h1>Folder structure</h1>
            <p>
              BuilderKit includes a recommended structure tailored for modern
              Angular development. It reflects established best practices while
              also supporting the modular architecture.
            </p>
            <p>
              This structure separates concerns in a clean and predictable way.
              Each part of the application has a dedicated place, making it easy
              to locate features, shared utilities, and core functionality.
            </p>
            <p>
              While you don't have to follow this structure exactly, it's a
              solid foundation that can help keep your project organized as it
              grows.
            </p>
          </article>

          <mat-tree
            class="rounded-xl border bg-neutral-a2 px-3 py-2"
            [dataSource]="folderStructure"
            [childrenAccessor]="childrenAccessor"
            #folderStructureTree
          >
            <!-- Tree node template for leaf nodes -->
            <mat-nested-tree-node
              class="ms-7 font-mono font-medium"
              *matTreeNodeDef="let node"
            >
              <div class="flex items-center gap-x-1">
                @if (node.name !== '...') {
                  <mat-icon
                    class="me-1 size-4"
                    svgIcon="file"
                  />
                }
                <div>{{ node.name }}</div>
              </div>
            </mat-nested-tree-node>

            <!-- Tree node template for expandable nodes -->
            <mat-nested-tree-node
              *matTreeNodeDef="let node; when: hasChild"
              [isExpandable]="node.children && node.children.length > 0"
              [isExpanded]="node.expanded"
            >
              <div class="mat-tree-node">
                <button
                  matIconButton
                  matTreeNodeToggle
                  class="tiny"
                >
                  <mat-icon
                    [svgIcon]="
                      folderStructureTree.isExpanded(node)
                        ? 'chevron-down'
                        : 'chevron-right'
                    "
                  ></mat-icon>
                </button>

                <div class="flex items-center gap-x-1">
                  <mat-icon
                    class="mx-1 size-4"
                    [svgIcon]="
                      folderStructureTree.isExpanded(node)
                        ? 'folder-open'
                        : 'folder'
                    "
                  />
                  <div class="font-mono font-medium">{{ node.name }}</div>
                </div>
              </div>

              <!-- Node children -->
              <div
                class="ms-7 flex flex-col"
                [class.hidden]="!folderStructureTree.isExpanded(node)"
              >
                <ng-container matTreeNodeOutlet></ng-container>
              </div>
            </mat-nested-tree-node>
          </mat-tree>
        </div>
      </div>
    </div>
  `,
})
export default class AdminFolderStructure {
  private childrenAccessor = (node: Dir) => node.children ?? [];
  private hasChild = (_: number, node: Dir) =>
    !!node.children && node.children.length > 0;

  private folderStructure: Dir[] = [
    {
      name: 'src',
      expanded: true,
      children: [
        {
          name: 'app',
          expanded: true,
          children: [
            {
              name: 'core',
              expanded: false,
              children: [
                { name: 'icons', children: [{ name: '...' }] },
                { name: 'local-storage', children: [{ name: '...' }] },
                { name: 'media', children: [{ name: '...' }] },
                { name: 'theming', children: [{ name: '...' }] },
                { name: 'window', children: [{ name: '...' }] },
              ],
            },
            {
              name: 'domains',
              expanded: false,
              children: [
                {
                  name: 'admin',
                  expanded: false,
                  children: [
                    {
                      name: 'layout',
                      children: [
                        { name: 'components', children: [{ name: '...' }] },
                        { name: 'layout.ts' },
                      ],
                    },
                    {
                      name: 'modules',
                      children: [
                        { name: 'dashboard', children: [{ name: '...' }] },

                        { name: 'settings', children: [{ name: '...' }] },
                        { name: 'subscriptions', children: [{ name: '...' }] },
                        { name: 'users', children: [{ name: '...' }] },
                      ],
                    },
                    { name: 'routes.ts' },
                  ],
                },
                {
                  name: 'app',
                  expanded: false,
                  children: [
                    {
                      name: 'layouts',
                      children: [
                        {
                          name: 'app',
                          children: [{ name: '...' }],
                        },
                        {
                          name: 'empty',
                          children: [{ name: '...' }],
                        },
                      ],
                    },
                    {
                      name: 'modules',
                      children: [
                        {
                          name: 'customers',
                          expanded: false,
                          children: [
                            {
                              name: 'data',
                              expanded: false,
                              children: [
                                { name: 'customer.ts' },
                                { name: 'customer-api.ts' },
                                { name: 'customers-service.ts' },
                              ],
                            },
                            {
                              name: 'features',
                              expanded: false,
                              children: [
                                { name: 'customers-details.ts' },
                                { name: 'customers-list.ts' },
                                { name: 'customers-new.ts' },
                              ],
                            },
                            {
                              name: 'ui',
                              expanded: false,
                              children: [
                                {
                                  name: 'customers-form',
                                  expanded: false,
                                  children: [
                                    {
                                      name: 'tabs',
                                      expanded: false,
                                      children: [
                                        { name: 'account.ts' },
                                        { name: 'general.ts' },
                                        { name: 'notes.ts' },
                                        { name: 'profile.ts' },
                                        { name: 'security.ts' },
                                      ],
                                    },
                                    { name: 'customers-form.ts' },
                                  ],
                                },
                                {
                                  name: 'customers-table',
                                  expanded: false,
                                  children: [
                                    { name: 'customers-table.ts' },
                                    { name: 'table-customizer.ts' },
                                    { name: 'table-filters.ts' },
                                  ],
                                },
                                {
                                  name: 'no-customers',
                                  expanded: false,
                                  children: [{ name: 'no-customers.ts' }],
                                },
                              ],
                            },
                            { name: 'routes.ts' },
                          ],
                        },
                        { name: 'settings', children: [{ name: '...' }] },
                        { name: 'users', children: [{ name: '...' }] },
                      ],
                    },
                    { name: 'shared', children: [{ name: '...' }] },
                    {
                      name: 'routes.ts',
                    },
                  ],
                },
                {
                  name: 'auth',
                  expanded: false,
                  children: [
                    {
                      name: 'modules',
                      children: [
                        { name: 'sign-in', children: [{ name: '...' }] },
                        { name: 'sign-out', children: [{ name: '...' }] },
                      ],
                    },
                    { name: 'layout.ts' },
                    { name: 'routes.ts' },
                  ],
                },
                { name: 'docs', expanded: false, children: [{ name: '...' }] },
                {
                  name: 'website',
                  expanded: false,
                  children: [{ name: '...' }],
                },
              ],
            },
            {
              name: 'ui',
              expanded: false,
              children: [
                { name: 'alert-dialog', children: [{ name: '...' }] },
                { name: 'collapsible', children: [{ name: '...' }] },
                { name: 'sidebar', children: [{ name: '...' }] },
                { name: 'utils', children: [{ name: '...' }] },
              ],
            },
            { name: 'app.config.server.ts' },
            { name: 'app.config.ts' },
            { name: 'app.routes.server.ts' },
            { name: 'app.routes.ts' },
            { name: 'app.ts' },
          ],
        },
        {
          name: 'styles',
          expanded: false,
          children: [
            { name: 'base', children: [{ name: '...' }] },
            { name: 'components', children: [{ name: '...' }] },
            { name: 'material', children: [{ name: '...' }] },
            { name: 'tailwindcss', children: [{ name: '...' }] },
            { name: 'third-party', children: [{ name: '...' }] },
            { name: 'styles.css' },
          ],
        },
        { name: 'index.html' },
        { name: 'main.server.ts' },
        { name: 'main.ts' },
        { name: 'server.ts' },
        { name: 'styles.css' },
      ],
    },
  ];
}
