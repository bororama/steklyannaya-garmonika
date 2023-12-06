import { Controller, Get} from '@nestjs/common';

@Controller('meta')
export class MetaverseController {

    @Get('haiku')
    haiku(): string {
        const haikuArray : Array<string> = [
           " Pasó el ayer,\
            pasó también el hoy:\
            se va la primavera.",

            "La flor del té,\
            ¿es blanca o amarilla?\
            Perplejidad.",

            "Melancolía,\
            más que el año pasado:\
            tarde de otoño.",

            "Lluvias de mayo.\
            Y enfrente del gran río\
            un par de casas.",

            "Un aguacero.\
            Se agarran a las yerbas,\
            los gorriones.",

            "Niña muda\
            convertida en mujer:\
            ya se perfuma.",

            "Incluso mi esposa\
            actúa como una forastera,\
            esta mañana de primavera.",

            "Encender una vela\
            Con otra vela;\
            Una noche de primavera.",

            "El halo de la luna, -\
            ¿No es el aroma del ciruelo\
            Elevándose al cielo?",

            "Acercando el brasero\
            A los pies,\
            Parece tan lejos del corazón.",

            "Lentos días pasando, acumulándose,\
            ¡Que lejos están,\
            Las cosas del pasado!",

            "Sacos de semillas\
            Mojados\
            Por la lluvia primaveral.",

            "La primera helada del año;\
            Mirando a la grulla enferma\
            A lo lejos.",

            "Labrando el campo:\
            La nube que nunca se movió\
            Ha desaparecido.",
        ];
        return haikuArray[Math.floor(Math.random() * haikuArray.length)];
    }
}
