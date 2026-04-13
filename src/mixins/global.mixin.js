import { GROUP_NAME_LIST } from '@/util/constants';
import { supabase } from '@/supabase';

export default {
    data() {
        return {
            _zoneList: [], // Supabase'den çekilen bölgeler
        };
    },
    async created() {
        await this._fetchZones();
    },
    computed: {
        getGroupNameList() {
            // Önce Supabase verisini dene, yoksa sabit listeye dön
            return (groupId) => {
                if (this._zoneList?.length) {
                    const zone = this._zoneList.find(z => z.value === Number(groupId));
                    return zone ? zone.label : 'Bilinmiyor';
                }
                return GROUP_NAME_LIST[groupId] || 'Bilinmiyor';
            };
        },
        getZoneList() {
            if (this._zoneList?.length) {
                return this._zoneList;
            }
            // Fallback: sabit liste
            return Object.entries(GROUP_NAME_LIST).map(([value, label]) => ({
                label,
                value: Number(value),
            }));
        },
    },
    methods: {
        async _fetchZones() {
            const tenant_id = localStorage.getItem('tenant_id');
            if (!tenant_id) return;

            const { data, error } = await supabase
                .from('zones')
                .select('id, name, day')
                .eq('tenant_id', tenant_id)
                .order('day', { ascending: true });

            if (!error && data) {
                // value olarak `day` (number) kullan — customers.group alanı zones.day saklar
                this._zoneList = data.map(z => ({
                    label: z.name,
                    value: Number(z.day),
                    id: z.id,
                }));
            }
        },
    },
};