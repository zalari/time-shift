import { Clockodo, CustomersParams, ProjectsParams } from 'clockodo';
import { ClockodoAdapterConfigValues } from '../domain/config.fields';
import { EntriesParams } from 'clockodo/dist/clockodo';
import { ClockodoProject } from '../domain/Clockodo/clockodo-project';
import { ClockodoTimeEntry } from '../domain/Clockodo/clockodo-time-entry';
import { ClockodoService } from '../domain/Clockodo/clockodo-service';
import { ClockodoCustomer } from '../domain/Clockodo/clockodo-customer';

export class NpmClockodoClient {
  private readonly _clockodo: Clockodo;

  constructor(config: ClockodoAdapterConfigValues) {
    this._clockodo = new Clockodo({
      client: {
        name: config.application,
        email: config.applicationEmail,
      },
      authentication: {
        user: config.user,
        apiKey: config.apiKey,
      },
    });
  }

  async canConnect(): Promise<boolean> {
    try {
      const clockReturnType = await this._clockodo.getClock();
      return !!clockReturnType.currentTime;
    } catch (error) {
      console.error(`Could not connect to Clockodo: ${error}`);
      return false;
    }
  }

  async getCustomers(params?: CustomersParams): Promise<ClockodoCustomer[]> {
    const customers = await this._clockodo.getCustomers(params);
    return customers.customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      number: customer.number,
    }));
  }

  async getProjects(params?: ProjectsParams): Promise<ClockodoProject[]> {
    const projects = await this._clockodo.getProjects(params);

    return projects.projects.map(project => ({
      id: project.id,
      name: project.name,
      number: project.number,
      customerId: project.customersId,
    }));
  }

  async getServices(params?: Record<string, unknown>): Promise<ClockodoService[]> {
    const services = await this._clockodo.getServices(params);

    return services.services.map(service => ({
      id: service.id,
      name: service.name,
      number: service.number,
    }));
  }

  async getTimeEntries(params: EntriesParams): Promise<ClockodoTimeEntry[]> {
    const clock = await this._clockodo.getClock();
    const runningId = clock.running?.id ?? null;
    const entries = await this._clockodo.getEntries(params);

    return entries.entries.map(
      (entry): ClockodoTimeEntry => ({
        id: entry.id.toString(),
        isClockRunning: entry.id === runningId,
        text: entry.text,
        timeSince: entry.timeSince,
        timeUntil: entry.timeUntil,
      }),
    );
  }
}
