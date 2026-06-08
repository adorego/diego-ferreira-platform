import { Controller, Get, Param } from '@nestjs/common';
import { CmsService } from './cms.service';

@Controller('cms')
export class CmsController {
  constructor(private cms: CmsService) {}

  @Get('noticias')        getNoticias()              { return this.cms.getNoticias(); }
  @Get('noticias/:slug')  getNoticia(@Param('slug') slug: string) { return this.cms.getNoticia(slug); }

  @Get('articulos')       getArticulos()             { return this.cms.getArticulos(); }
  @Get('articulos/:slug') getArticulo(@Param('slug') slug: string) { return this.cms.getArticulo(slug); }

  @Get('eventos')         getEventos()               { return this.cms.getEventos(); }
  @Get('videos')          getVideos()                { return this.cms.getVideos(); }
  @Get('podcasts')        getPodcasts()              { return this.cms.getPodcasts(); }
}
