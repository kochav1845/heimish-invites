// Centralized image management with preloading
export const images = {
  // Hero and main images
  hero: {
    video: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/videos/hero.mp4',
  },
  
  // Logo and branding
  logo: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/logo%20stardev.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L2xvZ28gc3Rh',
  
  // Alternating section images
  alternating: {
    organize: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/alternaqte%20orgenize.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L2FsdGVybmFxdGUgb3JnZW5pemUucG5nIiwiaWF0IjoxNzQ3NTk5OTk1LCJleHAiOjE5MDUyNzk5OTV9.JGFvrxHWvLC_foQtJU0fEMdKLRqD1LTPRJ9dlhSWAhc',
    computer: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/computer.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L2NvbXB1dGVyLnBuZyIsImlhdCI6MTc0NzU5OTUzNCwiZXhwIjoxOTA1Mjc5NTM0fQ.3u-c1VO5044UK7xpaxjdPZL0g9CAl9pO7fdVh6vDGyw',
    database: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/stardev%20alternating%20images/database.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3N0YXJkZXYgYWx0ZXJuYXRpbmcgaW1hZ2VzL2RhdGFiYXNlLnBuZyIsImlhdCI6MTc0NzYwMjg2OSwiZXhwIjoxOTA1MjgyODY5fQ.dTPmIL_gRfXTS0T0ZqU4Til9tL11MgIoVSREYsw2DPI'
  },
  
  // Carousel images
  carousel: [
    'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/stardev%20alternating%20images/2.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3N0YXJkZXYgYWx0ZXJuYXRpbmcgaW1hZ2VzLzIud2VicCIsImlhdCI6MTc0NjM5NzcyMywiZXhwIjoxOTA0MDc3NzIzfQ.vF5Fe1dI4ESeFjCqV6j9rjov0QdAOAAldvW1uomHczk',
    'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/stardev%20alternating%20images/3.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3N0YXJkZXYgYWx0ZXJuYXRpbmcgaW1hZ2VzLzMud2VicCIsImlhdCI6MTc0Njk5NTUyNSwiZXhwIjoxOTA0Njc1NTI1fQ.GGj3b1VpJiTnXQlQQzSVr1j04OoOEgKjaAl16VxEtjY',
    'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/stardev%20alternating%20images/4.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3N0YXJkZXYgYWx0ZXJuYXRpbmcgaW1hZ2VzLzQud2VicCIsImlhdCI6MTc0Njk5NTU5NSwiZXhwIjoxOTA0Njc1NTk1fQ.qHsguRg4b5K2dW2iSSBzxkrDV6i8enqlxmYT47N6Kus',
    'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/stardev%20alternating%20images/gettyimages-1401846043-2048x2048.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3N0YXJkZXYgYWx0ZXJuYXRpbmcgaW1hZ2VzL2dldHR5aW1hZ2VzLTE0MDE4NDYwNDMtMjA0OHgyMDQ4LndlYnAiLCJpYXQiOjE3NDY5OTU2MjIsImV4cCI6MTkwNDY3NTYyMn0.7BBLUBDr7Y6Pz527dnQraNT8bsMex3Ti3roNLgWNKLI',
    'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/stardev%20alternating%20images/gettyimages-1488521147-2048x2048.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3N0YXJkZXYgYWx0ZXJuYXRpbmcgaW1hZ2VzL2dldHR5aW1hZ2VzLTE0ODg1MjExNDctMjA0OHgyMDQ4LndlYnAiLCJpYXQiOjE3NDY5OTU2NTYsImV4cCI6MTkwNDY3NTY1Nn0.rbCXhEBmT6MSf9q-owT5HZVl-_qNe-ar3nebDJNOXuc',
    'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/stardev%20alternating%20images/gettyimages-1530973530-2048x2048.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3N0YXJkZXYgYWx0ZXJuYXRpbmcgaW1hZ2VzL2dldHR5aW1hZ2VzLTE1MzA5NzM1MzAtMjA0OHgyMDQ4LndlYnAiLCJpYXQiOjE3NDY5OTU2NzUsImV4cCI6MTkzNjIxMTY3NX0.zqHpgbcdTOUwVCT8TsEJnaJ1Pkra0FTZVxPRgSW5b5U',
    'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/stardev%20alternating%20images/gettyimages-1701652586-2048x2048.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3N0YXJkZXYgYWx0ZXJuYXRpbmcgaW1hZ2VzL2dldHR5aW1hZ2VzLTE3MDE2NTI1ODYtMjA0OHgyMDQ4LndlYnAiLCJpYXQiOjE3NDY5OTU3MDAsImV4cCI6MTkwNDY3NTcwMH0.m19M6BM9FvlfMBvVqrHgrhW0_MfXI2rv3IZnxR76RAY',
    'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/stardev%20alternating%20images/gettyimages-2140174020-2048x2048.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3N0YXJkZXYgYWx0ZXJuYXRpbmcgaW1hZ2VzL2dldHR5aW1hZ2VzLTIxNDAxNzQwMjAtMjA0OHgyMDQ4LndlYnAiLCJpYXQiOjE3NDY5OTU3MTksImV4cCI6MTkwNDY3NTcxOX0.ZXY9nDt8I75jA89aIkR5s69HcwFaSWtXpgYbeZG4FtE',
    'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/stardev%20alternating%20images/gettyimages-2197955227-612x612.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3N0YXJkZXYgYWx0ZXJuYXRpbmcgaW1hZ2VzL2dldHR5aW1hZ2VzLTIxOTc5NTUyMjctNjEyeDYxMi53ZWJwIiwiaWF0IjoxNzQ2OTk1NzU2LCJleHAiOjE5MzYyMTE3NTZ9.3IysV2eHGx3tlDCq0pQsP4qXj1eaYJFYglFDxOWbrjU',
    'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/stardev%20alternating%20images/gettyimages-2200128716-2048x2048.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3N0YXJkZXYgYWx0ZXJuYXRpbmcgaW1hZ2VzL2dldHR5aW1hZ2VzLTIyMDAxMjg3MTYtMjA0OHgyMDQ4LndlYnAiLCJpYXQiOjE3NDY5OTU3NzIsImV4cCI6MzE2NjExNTc3Mn0.GBDVA78oDKLULHYWVGI0oF8ZNcDBoaQupkQZzfhoOcM'
  ],
  
  // Portfolio images
  portfolio: {
    gabeitzdukeh: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/portfolio/gabeitzdukeh.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3BvcnRmb2xpby9nYWJlaXR6ZHVrZWgucG5nIiwiaWF0IjoxNzQ3NjAyNjEwLCJleHAiOjE5MDUyODI2MTB9.9JaieLA256RD3lyuetzZH-n3Z0QNhvSh4XmqNbuaqr0',
    strade: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/portfolio/starde.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3BvcnRmb2xpby9zdGFyZGUucG5nIiwiaWF0IjoxNzQ3NjAxMTIxLCJleHAiOjE5MDUyODExMjF9.g8-zjnM1QziX8Vt3tJQInjZFndtegnCB3OOKNzdn33Y',
    monticello: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/portfolio/monticelloretreat.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3BvcnRmb2xpby9tb250aWNlbGxvcmV0cmVhdC5wbmciLCJpYXQiOjE3NDc2MDE1MzMsImV4cCI6MTkwNTI4MTUzM30.af85dMFQPX87DQMT3n8JIXk8as81zUij3_jPl4MwFDs',
    onstage: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/portfolio/onstagestudio.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3BvcnRmb2xpby9vbnN0YWdlc3R1ZGlvLnBuZyIsImlhdCI6MTc0NzYwMTY5MywiZXhwIjoxOTA1MjgxNjkzfQ.xE5GuQfMZBgL5kGhgBCf3OY_SMf-omHYJJ5CD2Cpiuk',
    kerenhachesed: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/portfolio/kerenhavchesed.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3BvcnRmb2xpby9rZXJlbmhhdmNoZXNlZC5wbmciLCJpYXQiOjE3NDc2MDI3ODMsImV4cCI6MTkwNTI4Mjc4M30.3G9wbdKWG_m938Pqfz7_dQ53kQYRVNXx7B8vB0DDQyg',
    donai: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/portfolio/donai.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3BvcnRmb2xpby9kb25haS5wbmciLCJpYXQiOjE3NDc2MDIyMDUsImV4cCI6MTkwNTI4MjIwNX0.988AmrMHtAziW8AK9UE1J4qU9Aq9QCM3zoByljGh3VM'
  },
  
  // Tech logos
  tech: {
    react: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/fetures%20logos/reract-Photoroom.png',
    node: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/fetures%20logos/node-Photoroom.png',
    postgres: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/fetures%20logos/posgrs-Photoroom.png',
    stripe: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/fetures%20logos/stripe-Photoroom.png',
    aws: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/fetures%20logos/awspng.png',
    azure: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/fetures%20logos/azure-Photoroom.png',
    openai: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/fetures%20logos/openai-Photoroom.png',
    google: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/public/stardev/fetures%20logos/google-Photoroom.png'
  },
  
  // Feature backgrounds
  features: {
    background: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/features%20background.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L2ZlYXR1cmVzIGJhY2tncm91bmQucG5nIiwiaWF0IjoxNzQ3OTAxMTI4LCJleHAiOjIwNjMyNjExMjh9.hB7hYp7iq0ja3HtbgLVOBiHfonN_Zi08JXT9eVvNs9U'
  },
  
  // Carousel stand
  stand: 'https://ahmrghovmuxowchijumv.supabase.co/storage/v1/object/sign/stardev/stand%20(5).png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzM3ZjBkMzlhLTk2NzctNDUyNi04MjQ3LWU3NDU4ZjE5ZDY5MCJ9.eyJ1cmwiOiJzdGFyZGV2L3N0YW5kICg1KS5wbmciLCJpYXQiOjE3NDcxMjYxOTEsImV4cCI6MTkwNDgwNjE5MX0.3-6g9IJ__vnl-bGHmeVxqFIedl-WKM1nUKeaybhWxHk'
};

// Image preloader utility
export class ImagePreloader {
  private static instance: ImagePreloader;
  private loadedImages: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  static getInstance(): ImagePreloader {
    if (!ImagePreloader.instance) {
      ImagePreloader.instance = new ImagePreloader();
    }
    return ImagePreloader.instance;
  }

  async preloadImage(src: string): Promise<void> {
    if (this.loadedImages.has(src)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedImages.add(src);
        this.loadingPromises.delete(src);
        resolve();
      };
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  async preloadImages(sources: string[]): Promise<void[]> {
    return Promise.all(sources.map(src => this.preloadImage(src)));
  }

  // Preload critical images immediately
  async preloadCriticalImages(): Promise<void> {
    const criticalImages = [
      images.alternating.organize,
      images.alternating.computer,
      images.portfolio.gabeitzdukeh,
      images.portfolio.strade,
      images.portfolio.monticello,
      ...images.tech.react ? [images.tech.react] : [],
      ...images.tech.node ? [images.tech.node] : [],
      ...images.tech.postgres ? [images.tech.postgres] : []
    ];

    try {
      await this.preloadImages(criticalImages);
    } catch (error) {
      console.warn('Some critical images failed to preload:', error);
    }
  }

  // Preload carousel images with lower priority
  async preloadCarouselImages(): Promise<void> {
    try {
      await this.preloadImages(images.carousel);
    } catch (error) {
      console.warn('Some carousel images failed to preload:', error);
    }
  }

  // Preload all remaining images
  async preloadAllImages(): Promise<void> {
    const allImages = [
      ...Object.values(images.alternating),
      ...Object.values(images.portfolio),
      ...Object.values(images.tech),
      ...images.carousel,
      images.features.background,
      images.stand
    ];

    try {
      await this.preloadImages(allImages);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }
}

// Export preloader instance
export const imagePreloader = ImagePreloader.getInstance();