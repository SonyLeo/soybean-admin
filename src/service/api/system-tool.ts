import FileSaver from 'file-saver';
import { request } from '../request';

/** 获取代码生成列表 */
export const fetchGenTableList = (params: Api.SystemManage.GenTableForm) => {
  return request<Api.SystemManage.GenTableList>({
    url: '/tool/gen/list',
    method: 'get',
    params
  });
};

/* 查询表详细信息 */
export const fetchGetGenTable = (tableId: string | number) => {
  return request<Api.SystemManage.GenTableInfo>({
    url: `/tool/gen/${tableId}`,
    method: 'get'
  });
};

/** 预览代码生成信息 */
export const fetchGenCode = (tableId: string | number) => {
  return request<Record<string, string>>({
    url: `/tool/gen/preview/${tableId}`,
    method: 'get'
  });
};

/** 获取指定数据库的数据表 */
export const fetchDBTableList = (params: Api.SystemManage.DBTableForm) => {
  return request<Api.SystemManage.GenTableList>({
    url: `/tool/gen/db/list`,
    method: 'get',
    params
  });
};

/** 导入表结构 */
export const fetchImportGenTable = (params: Api.SystemManage.DBTableImport) => {
  return request({
    url: `/tool/gen/importTable`,
    method: 'post',
    params
  });
};

/** 自定义路径生成代码 */
export const fetchDownloadCode = (tableId: string | number) => {
  return request({
    url: `/tool/gen/genCode/${tableId}`,
    method: 'get'
  });
};

/** 下载代码压缩包文件 */
export const fetchDownloadCodeZip = (tableId: string | number) => {
  request({
    url: `/tool/gen/batchGenCode?tableIdStr=${tableId}`,
    method: 'get',
    responseType: 'blob'
  }).then(res => {
    const { data } = res;
    if (data) {
      const blob = new Blob([data], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, 'soybean.zip');
      window.$message?.success('下载成功');
    }
  });
};

/** 删除数据表 */
export const fetchDelGenTable = (tableIds: string | number) => {
  return request({
    url: `/tool/gen/${tableIds}`,
    method: 'delete'
  });
};

/** 修改数据表 */
export const fetchUpdateGenTable = (data: Partial<Api.BackVO.GenTable>) => {
  return request({
    url: '/tool/gen',
    method: 'put',
    data
  });
};

/** 同步数据表 */
export const fetchSyncGenTable = (tableId: string | number) => {
  return request({
    url: `/tool/gen/synchDb/${tableId}`,
    method: 'get'
  });
};

/** 获取数据源名称 */
export const fetchGetDataSourceName = () => {
  return request<string[]>({
    url: '/tool/gen/getDataNames',
    method: 'get'
  });
};

/** 获取数据字典数据 */
export const fetchGetDictData = () => {
  return request<Api.SystemManage.DBDictList>({
    url: '/system/dict/type/optionselect',
    method: 'get'
  });
};
