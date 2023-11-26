import { Controller, Get} from '@nestjs/common';

@Controller('game')
export class GameController {
    @Get('test')
    test(): Object {
        return {
            p : "false",
            q : "true",
        };
    }

    @Get('haiku')
    haiku(): string {
        const haikus : Array<string> = [
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
        ];
        return haikus[Math.floor(Math.random() * 7)];
    }
}
