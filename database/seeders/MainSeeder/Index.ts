import Application from '@ioc:Adonis/Core/Application'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class IndexSeeder extends BaseSeeder {
  private async runSeeder(seeder: { default: typeof BaseSeeder }) {
    /**
     * Do not run when not in dev mode and seeder is development
     * only
     */
    if (seeder.default.developmentOnly && !Application.inDev) {
      return
    }

    await new seeder.default(this.client).run()
  }
  public async run() {
    await this.runSeeder(await import('../User'))
    await this.runSeeder(await import('../Channel'))
    await this.runSeeder(await import('../ChannelUser'))
    await this.runSeeder(await import('../Message'))
  }
}
