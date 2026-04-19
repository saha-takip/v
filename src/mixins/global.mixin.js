import { GROUP_NAME_LIST } from '@/util/constants';
import { supabase } from '@/supabase';
import { store, mutations } from '@/store';

export default {
    data() {
        return {
            // Local state kaldırıldı, store kullanılacak
        };
    },
    async created() {
        // Eğer store'da henüz veri yoksa bir kez çekelim
        if (!store.zones || store.zones.length === 0) {
            await this._fetchZones();
        }
    },
    computed: {
        _zoneList() {
            return store.zones || [];
        },
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
                const mappedZones = data.map(z => ({
                    label: z.name,
                    value: Number(z.day),
                    id: z.id,
                }));
                mutations.setZones(mappedZones);
            }
        },
    },
};