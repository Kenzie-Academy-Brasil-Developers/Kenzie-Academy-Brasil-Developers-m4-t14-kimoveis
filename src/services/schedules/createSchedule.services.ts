import { Repository } from "typeorm";
import { AppDataSource } from "../../data-source";
import { RealEstate, Schedule, User } from "../../entities";
import { AppError } from "../../error";
import { ICreateSchedule } from "../../interfaces/schedules.interfaces";

const createScheduleService = async (
  { date, hour, realEstateId }: ICreateSchedule,
  idUser: number
): Promise<{ message: string }> => {
  const [ano, dia, mes] = date.split("/").map(Number);
  const formatedDate = new Date(ano, mes - 1, dia);

  const scheduleRepo: Repository<Schedule> =
    AppDataSource.getRepository(Schedule);

  const userRepo: Repository<User> = AppDataSource.getRepository(User);

  const realEstateRepo: Repository<RealEstate> =
    AppDataSource.getRepository(RealEstate);

  const realEstateExists: RealEstate | null = await realEstateRepo.findOneBy({
    id: realEstateId,
  });

  if (!realEstateExists) {
    throw new AppError("RealEstate not found", 404);
  }

  const scheduleExists = await scheduleRepo
    .createQueryBuilder("schedule")
    .where("schedule.hour = :hour", { hour })
    .andWhere("schedule.hour = :hour", { hour })
    .andWhere("schedule.realEstate.id = :realEstateId", { realEstateId })
    .getOne();

  if (scheduleExists) {
    throw new AppError(
      "Schedule to this real estate at this date and time already exists",
      409
    );
  }

  const userHasSchedule = await scheduleRepo
    .createQueryBuilder("schedule")
    .where("schedule.hour = :hour", { hour })
    .andWhere("schedule.user = :idUser", { idUser })
    .getOne();

  if (userHasSchedule) {
    throw new AppError(
      "User schedule to this real estate at this date and time already exists",
      409
    );
  }

  const hourParts = hour.split(":");
  const visitHour = parseInt(hourParts[0], 10);
  if (visitHour < 8 || visitHour >= 18) {
    throw new AppError("Invalid hour, available times are 8AM to 18PM", 400);
  }

  const visitDate = formatedDate;
  const dayOfWeek = visitDate.getUTCDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    throw new AppError("Invalid date, work days are monday to friday", 400);
  }

  const user: User | null = await userRepo.findOneBy({
    id: idUser,
  });

  const realEstate: RealEstate | null = await realEstateRepo.findOneBy({
    id: realEstateId,
  });

  if (!realEstate) {
    throw new AppError("realEstate not found", 404);
  }

  const schedule: Schedule = scheduleRepo.create({
    date: formatedDate,
    hour: hour,
    realEstate: realEstate,
    user: user!,
  });

  await scheduleRepo.save(schedule);

  return { message: "Schedule created" };
};

export default createScheduleService;
