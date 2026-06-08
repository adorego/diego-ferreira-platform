import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { readFileSync } from 'fs';

@Injectable()
export class CmsService {
  private load<T>(file: string): T[] {
    try {
      const raw = readFileSync(join(__dirname, 'data', file), 'utf-8');
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }

  getNoticias() { return this.load('noticias.json'); }
  getNoticia(slug: string) {
    const items = this.load<{ slug: string }[]>('noticias.json');
    const item = items.find((n: any) => n.slug === slug);
    if (!item) throw new NotFoundException(`Noticia '${slug}' no encontrada`);
    return item;
  }

  getArticulos() { return this.load('articulos.json'); }
  getArticulo(slug: string) {
    const items = this.load<{ slug: string }[]>('articulos.json');
    const item = items.find((a: any) => a.slug === slug);
    if (!item) throw new NotFoundException(`Artículo '${slug}' no encontrado`);
    return item;
  }

  getEventos()  { return this.load('eventos.json'); }
  getVideos()   { return this.load('videos.json'); }
  getPodcasts() { return this.load('podcasts.json'); }
}
