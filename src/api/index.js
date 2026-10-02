// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

/**
 * 音乐播放器 - 通过 Meting API 代理获取各平台歌曲
 * server: netease(网易云) / tencent(QQ音乐) / kugou(酷狗) / kuwo(酷我) / bilibili / migu(咪咕)
 */

// Meting API 服务器列表（按优先级自动故障转移）
const METING_APIS = [
    'https://api.wuenci.com/meting/api/',
    'https://api.injahow.cn/meting/api/',
    'https://meting.qjqq.cn/api/',
];

// 通过 Meting API 获取播放列表
export const getPlayerList = async (server, type, id) => {
    let lastError = null;

    for (const api of METING_APIS) {
        try {
            const res = await fetch(`${api}?server=${server}&type=${type}&id=${id}`);
            const data = await res.json();

            if (!Array.isArray(data) || !data[0]) {
                throw new Error('API 返回数据为空');
            }

            // 处理 QQ 音乐的 @ 前缀直链（需 jsonp 解析）
            if (data[0].url && data[0].url.startsWith('@')) {
                const jsonpUrl = data[0].url.split('@').pop();
                if (!jsonpUrl) {
                    throw new Error('QQ 音乐接口未返回播放地址');
                }
                const jsonpData = await fetchJsonp(jsonpUrl).then(res => res.json());
                const sipList = jsonpData.req_0?.data?.sip || [];
                const domain = (sipList.find(i => !i.startsWith('http://ws')) || sipList[0] || '')
                    .replace('http://', 'https://');
                const midurlinfo = jsonpData.req_0?.data?.midurlinfo || [];

                return data.map((v, i) => ({
                    name: v.name || v.title || '未知歌曲',
                    artist: v.artist || v.author || '未知歌手',
                    url: domain + (midurlinfo[i]?.purl || ''),
                    cover: v.cover || v.pic || '',
                    lrc: v.lrc || '',
                }));
            }

            // 普通直链格式
            return data.map(v => ({
                name: v.name || v.title || '未知歌曲',
                artist: v.artist || v.author || '未知歌手',
                url: v.url || '',
                cover: v.cover || v.pic || '',
                lrc: v.lrc || '',
            }));

        } catch (err) {
            console.warn(`Meting API [${api}] 请求失败:`, err.message);
            lastError = err;
        }
    }

    throw lastError || new Error('所有 Meting API 服务器均不可用');
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
    const res = await fetch("https://v1.hitokoto.cn");
    return await res.json();
};

/**
 * 每日一句（金山词霸）
 */

// 获取每日一句
export const getDailySentence = async (dateStr) => {
    const res = await fetchJsonp("https://sentence.iciba.com/index.php?c=dailysentence&m=getdetail&title=" + dateStr);
    return await res.json();
}

/**
 * 天气
 */

// 获取高德地理位置信息
export const getAdcode = async (key) => {
    const res = await fetch(`https://restapi.amap.com/v3/ip?key=${key}`);
    return await res.json();
};

// 获取高德地理天气信息
export const getWeather = async (key, city) => {
    const res = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`);
    return await res.json();
};

/**
 * 获取配置
 */

// 加载数据（外部接口需要配置跨域）
export const loadData = async (url) => {
    const res = await fetch(url);
    return await res.json();
};