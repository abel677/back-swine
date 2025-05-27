import { PigReproductiveCalculatorUseCase } from "../../../pigs/application/use-cases/pig-reproductive-calculator.usecase";
import { DomainDateTime } from "../../../shared/domain-datetime";
import { PigReproductiveState } from "../../../shared/domain/enums";
import { Notification } from "../../domain/notification.entity";
import { NotificationRepository } from "../../domain/notification.repository";

export class CreateSowNotificationsUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly pigCalculatorUseCase: PigReproductiveCalculatorUseCase
  ) {}
  async execute(params: {
    farmId: string;
    reproductiveState: PigReproductiveState;
    code: string;
    dateStart: Date;
  }) {
    const reproductiveState = params.reproductiveState;
    const isGestation = reproductiveState === PigReproductiveState.Gestation;
    const isLactation = reproductiveState === PigReproductiveState.Lactation;

    const { keyDates } = await this.pigCalculatorUseCase.execute(
      params.farmId,
      params.reproductiveState,
      params.dateStart
    );

    // 1. crear notificaciones de eventos
    for (const data of keyDates) {
      const notification = Notification.create({
        farmId: params.farmId,
        title: `Alerta Reproductiva Cerda ${params.code}`,
        description: data.description,
        dateSent: data.date,
        data: JSON.stringify({ code: params.code }),
      });
      await this.notificationRepository.create(notification);
    }

    //2. crear notificaciones de vacunación
    if (isGestation) {
      const notification = Notification.create({
        farmId: params.farmId,
        title: `Alerta de vacunación - Cerda ${params.code}`,
        description: `Administrar la primera dosis de la vacuna bacterina-toxoide a la cerda ${params.code} en fecha ${params.dateStart}. 
        La vacuna contiene toxoide de *Clostridium perfringens* tipo C y cepas enterotoxigénicas de *E. coli* (K88, K99, 987P y F41), químicamente inactivadas. 
        Requiere 2 dosis con 3 semanas de diferencia, aplicadas durante la segunda mitad de la gestación (entre los días 80 y 100). Conservar entre 2°C y 8°C.`,
        dateSent: DomainDateTime.addDays(params.dateStart, 80),
        data: JSON.stringify({ code: params.code }),
      });
      await this.notificationRepository.create(notification);
    }
    if (isLactation) {
      const notification = Notification.create({
        farmId: params.farmId,
        title: `Alerta de vacunación - Cerda ${params.code}`,
        description: `Administrar 2 mL de FARROWSURE-GOLD-B por vía intramuscular a la cerda ${params.code} entre los días 2 y 5 postparto.
        Esta vacuna contiene:
        - Virus del Parvovirus Porcino (PPV)
        - Bacterina con *E. rhusiopathiae* (cepa CN3342)
        - Leptospiras: *L. bratislava*, *L. canicola*, *L. grippotyphosa*, *L. hardjo*, *L. icterohaemorrhagiae*, *L. pomona* (cepas especificadas).
        Agitar bien antes de aplicar. Esta revacunación debe realizarse en cada parto.`,
        dateSent: DomainDateTime.addDays(params.dateStart, 2),
        data: JSON.stringify({ code: params.code }),
      });

      const notificationDay0 = Notification.create({
        farmId: params.farmId,
        title: `Manejo preparto - Cerda ${params.code}`,
        description: `Realizar limpieza y desinfección de la maternidad y de la cerda. 
                      Controlar alimentación progresiva postparto: Semana 1-2: 3 kg, Semana 3: 4 kg, Semana 4: 5 kg.`,
        dateSent: params.dateStart,
        data: JSON.stringify({ code: params.code }),
      });

      const notificationDay1 = Notification.create({
        farmId: params.farmId,
        title: `Manejo Día 1 - Lechones de la cerda ${params.code}`,
        description: `Cortar colmillos y cola a los lechones.
                      Aplicar 1 ml de hierro y 1 ml de coccidiostato (Genzuril vía oral).
                      Cortar cordón, desinfectar con yodo, controlar peso (1.4-1.5 kg) y temperatura (30-32°C).`,
        dateSent: DomainDateTime.addDays(params.dateStart, 1),
        data: JSON.stringify({ code: params.code }),
      });

      const notificationDay2 = Notification.create({
        farmId: params.farmId,
        title: `Manejo Día 2 - Lechones y madre ${params.code}`,
        description: `Aplicar 2 ml de Farrowsure a la madre.`,
        dateSent: DomainDateTime.addDays(params.dateStart, 2),
        data: JSON.stringify({ code: params.code }),
      });

      const notificationDay3 = Notification.create({
        farmId: params.farmId,
        title: `Manejo Día 3 - Lechones de la cerda ${params.code}`,
        description: `Aplicar segunda dosis de hierro (2 ml) a los lechones.`,
        dateSent: DomainDateTime.addDays(params.dateStart, 3),
        data: JSON.stringify({ code: params.code }),
      });

      const notificationDay8 = Notification.create({
        farmId: params.farmId,
        title: `Vacunación Día 8 - Lechones de la cerda ${params.code}`,
        description: `Aplicar 2 ml de Neumopig. Control de peso (3.1 kg). 
                      Iniciar adaptación con papilla de alimento pre-destete.`,
        dateSent: DomainDateTime.addDays(params.dateStart, 8),
        data: JSON.stringify({ code: params.code }),
      });

      const notificationDay16 = Notification.create({
        farmId: params.farmId,
        title: `Vacunación Día 16 - Lechones y madre ${params.code}`,
        description: `Revacunar con Neumopig (2 ml), 
                      controlar peso (4.8 kg), desparasitar con doramectina: 0.4 ml a lechones, 4 ml a la madre.`,
        dateSent: DomainDateTime.addDays(params.dateStart, 16),
        data: JSON.stringify({ code: params.code }),
      });

      const notificationDay25 = Notification.create({
        farmId: params.farmId,
        title: `Vacunación Día 25 - Lechones y madre ${params.code}`,
        description: `Aplicar CerdoBac: 3 ml en lechones y 5 ml en la madre.`,
        dateSent: DomainDateTime.addDays(params.dateStart, 25),
        data: JSON.stringify({ code: params.code }),
      });

      const notificationDay35 = Notification.create({
        farmId: params.farmId,
        title: `Destete y vacunación Día 30 - Lechones ${params.code}`,
        description: `Aplicar 1 ml de cefalosporina (Cefacherry), realizar destete y controlar peso final (9.2 kg).`,
        dateSent: DomainDateTime.addDays(params.dateStart, 30),
        data: JSON.stringify({ code: params.code }),
      });

      const notificationDay45 = Notification.create({
        farmId: params.farmId,
        title: `Vacunación PPC - Lechones de la cerda ${params.code}`,
        description: `Aplicar vacuna contra PPC entre los días 40 y 45. Coordinar con el veterinario para definir la fecha exacta.`,
        dateSent: DomainDateTime.addDays(params.dateStart, 42),
        data: JSON.stringify({ code: params.code }),
      });

      await this.notificationRepository.create(notification);
      await this.notificationRepository.create(notificationDay0);
      await this.notificationRepository.create(notificationDay1);
      await this.notificationRepository.create(notificationDay2);
      await this.notificationRepository.create(notificationDay3);
      await this.notificationRepository.create(notificationDay8);
      await this.notificationRepository.create(notificationDay16);
      await this.notificationRepository.create(notificationDay25);
      await this.notificationRepository.create(notificationDay35);
      await this.notificationRepository.create(notificationDay45);
    }
  }
}
