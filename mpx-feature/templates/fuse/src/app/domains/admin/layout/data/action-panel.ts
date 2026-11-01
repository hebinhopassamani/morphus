import { Service } from '@angular/core';

@Service()
export class ActionPanelService {
  users = [
    {
      id: 'DET3VJa6rYQeejyiYrH7E',
      name: 'Evan Gutmann',
      photo: '/images/photos/i26glj5ogfrlo5mhggfx2.jpg',
      email: 'evan.gutmann@example.com',
    },
    {
      id: 'EpGBfbV3DrkiXZqWRpm6x',
      name: 'Gloria Metz',
      photo: '/images/photos/kol3jpdula4mvn74wdnns.jpg',
      email: 'gloria.metz@example.com',
    },
    {
      id: 'dadABDjRU8GxXEcpybCRK',
      name: 'Lance Parisian',
      photo: null,
      email: 'lance.parisian@example.com',
    },
    {
      id: 'NnJZrLRZNRHLKnQefefWx',
      name: 'Lowell Lind',
      photo: '/images/photos/x05ipzq7r4helr3lzaatp.jpg',
      email: 'lowell.lind@example.com',
    },
    {
      id: 'B9Vi9KkbHFBqhdcUnejLh',
      name: 'Alton Rutherford',
      photo: null,
      email: 'alton.rutherford@example.com',
    },
  ];
  projects = [
    {
      id: 'builderkit',
      label: 'BuilderKit',
      data: {
        colorClass: 'bg-[var(--color-crimson-9)]',
      },
    },
    {
      id: 'spark',
      label: 'Spark',
      data: {
        colorClass: 'bg-[var(--color-jade-9)]',
      },
    },
    {
      id: 'fuse',
      label: 'Fuse',
      data: {
        colorClass: 'bg-[var(--color-sky-9)]',
      },
    },
    {
      id: 'nova',
      label: 'Nova',
      data: {
        colorClass: 'bg-[var(--color-purple-9)]',
      },
    },
  ];
}
