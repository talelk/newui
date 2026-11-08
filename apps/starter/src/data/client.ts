import { createDataClient } from '@talelk/newui-data/query'

/**
 * The one query client the app boots with.
 *
 * `App.tsx` hands it to `DataProvider`, and the analytics page hands it to
 * `connectRealtime` — the cache is the integration point, so both ends read
 * the same instance. `createDataClient` is the kit's opinion stated once;
 * this file is the starter stating it.
 */
export const dataClient = createDataClient()
