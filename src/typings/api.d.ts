/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Common {
    /** common params of paginating */
    interface PaginatingCommonParams {
      /** current page number */
      current: number;
      /** page size */
      size: number;
      /** total count */
      total: number;
    }

    /** common params of paginating query list data */
    interface PaginatingQueryRecord<T = any> extends PaginatingCommonParams {
      records: T[];
    }

    /**
     * enable status
     *
     * - "0": enabled
     * - "1": disabled
     */
    type EnableStatus = '0' | '1';

    /** common record */
    type CommonRecord<T = any> = {
      /** record id */
      id: number;
      /** record creator */
      createBy: string;
      /** record create time */
      createTime: string;
      /** record updater */
      updateBy: string;
      /** record update time */
      updateTime: string;
      /** record status */
      status: EnableStatus | null;
    } & T;

    /**
     * user gender
     *
     * - "0": "male"
     * - "1": "female"
     */
    type UserGender = '0' | '1';

    /** datepicker */
    type Value = [number, number];

    /**
     * 生成方式
     *
     * - '0': 压缩包
     * - '1': 自定义路径
     */
    type GenType = '0' | '1';
  }

  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      access_token: string;
      refresh_token: string;
    }

    interface Basic {
      userName: string;
      userId: string;
    }

    interface UserInfo {
      user: Auth.Basic;
      roles: string[];
      buttons: string[];
    }
  }

  /**
   * namespace Route
   *
   * backend api module: "route"
   */
  namespace Route {
    type ElegantConstRoute = import('@elegant-router/types').ElegantConstRoute;

    interface MenuRoute extends ElegantConstRoute {
      id: string;
    }

    interface UserRoute {
      routes: MenuRoute[];
      home: import('@elegant-router/types').LastLevelRouteKey;
    }
  }

  namespace BackVO {
    /** user */
    type User = Common.CommonRecord<{
      /** 用户ID */
      userId: string;

      /** 部门ID */
      deptId: string;

      /** 用户账号 */
      userName: string;

      /** 用户昵称 */
      nickName: string;

      /** 用户类型（sys_user系统用户） */
      userType: string;

      /** 用户邮箱 */
      email: string;

      /** 手机号码 */
      phonenumber: string;

      /** 用户性别（0男 1女 2未知） */
      sex: Common.UserGender | null;

      /** 头像地址 */
      avatar: string;

      /** 密码 */
      password: string;

      /** 最后登录IP */
      loginIp: string;

      /** 最后登录时间 */
      loginDate: number | [number, number];

      /** 备注 */
      remark: string;
    }>;

    /** genTable */
    type GenTable = Common.CommonRecord<{
      createDept: number;
      tableId: string;
      dataName: string;
      tableName: string;
      tableComment: string;
      subTableName: any;
      subTableFkName: any;
      className: string;
      tplCategory: string;
      packageName: string;
      moduleName: string;
      businessName: string;
      functionName: string;
      functionAuthor: string;
      genType: Common.GenType;
      genPath: string;
      pkColumn: any;
      columns: DbColumn[];
      remark: any;
      treeCode: any;
      treeParentCode: any;
      treeName: any;
      menuIds: any;
      parentMenuId: any;
      parentMenuName: any;
      tree: boolean;
      crud: boolean;
      dateRange: Common.Value | null;
    }>;

    /** DbColumn */
    type DbColumn = Common.CommonRecord<{
      createDept?: any;
      columnId?: any;
      tableId?: any;
      columnName?: any;
      columnComment?: any;
      columnType?: any;
      javaType?: any;
      javaField?: any;
      isPk?: any;
      isIncrement?: any;
      isRequired?: any;
      isInsert?: any;
      isEdit?: any;
      isList?: any;
      isQuery?: any;
      queryType?: any;
      htmlType?: any;
      dictType?: any;
      sort?: any;
      increment: boolean;
      capJavaField?: any;
      usableColumn: boolean;
      superColumn: boolean;
      list: boolean;
      pk: boolean;
      insert: boolean;
      edit: boolean;
      query: boolean;
      required: boolean;
    }>;

    /** DbTable */
    type DbTable = Common.CommonRecord<{
      createDept?: any;
      tableId?: any;
      tableName: string;
      tableComment: string;
      subTableName?: any;
      subTableFkName?: any;
      className?: any;
      tplCategory?: any;
      packageName?: any;
      moduleName?: any;
      businessName?: any;
      functionName?: any;
      functionAuthor?: any;
      genType?: any;
      genPath?: any;
      pkColumn?: any;
      columns: DbColumn[];
      params: any;
      options?: any;
      remark?: any;
      treeCode?: any;
      treeParentCode?: any;
      treeName?: any;
      menuIds?: any;
      parentMenuId?: any;
      parentMenuName?: any;
      tree: boolean;
      crud: boolean;
    }>;

    /** DBDict */
    type DBDict = {
      dictId: number;
      dictName: string;
      dictType: string;
      remark: string;
      createTime: string;
    };
  }

  /**
   * namespace SystemManage
   *
   * backend api module: "systemManage"
   */
  namespace SystemManage {
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /** role */
    type Role = Common.CommonRecord<{
      /** role name */
      roleName: string;
      /** role code */
      roleCode: string;
      /** role description */
      roleDesc: string;
    }>;

    /** role search params */
    type RoleSearchParams = CommonType.RecordNullable<
      Pick<SystemManage.Role, 'roleName' | 'roleCode' | 'status'> & CommonSearchParams
    >;

    /** role list */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    /** all role */
    type AllRole = Pick<Role, 'id' | 'roleName' | 'roleCode'>;

    /** user search params */
    type UserSearchParams = CommonType.RecordNullable<
      Pick<
        BackVO.User,
        'deptId' | 'userName' | 'nickName' | 'userType' | 'email' | 'phonenumber' | 'sex' | 'avatar' | 'password'
      > &
        CommonSearchParams
    >;

    /** user add/edit form */
    type UserForm = CommonType.RecordNullable<
      Pick<
        BackVO.User,
        | 'id'
        | 'deptId'
        | 'userName'
        | 'nickName'
        | 'userType'
        | 'email'
        | 'phonenumber'
        | 'sex'
        | 'avatar'
        | 'password'
        | 'status'
        | 'remark'
      > &
        CommonSearchParams
    >;

    /** user list */
    type UserList = Common.PaginatingQueryRecord<BackVO.User>;

    /** genTable add/edit form */
    type GenTableForm = CommonType.RecordNullable<
      Pick<BackVO.GenTable, 'dataName' | 'tableName' | 'tableComment' | 'dateRange'> & CommonSearchParams
    >;

    /** dbTable form */
    type DBTableForm = Omit<GenTableForm, 'dateRange'>;

    /** dbTable import */
    type DBTableImport = { tables: string; dataName: string };

    /** genTable list */
    type GenTableList = Common.PaginatingQueryRecord<BackVO.GenTable>;

    type GenTableInfo = {
      info: BackVO.GenTable;
      rows: BackVO.DbColumn[];
      tables: BackVO.DbTable[];
    };

    type DBDictList = Array<BackVO.DBDict>;

    /**
     * menu type
     *
     * - "0": directory
     * - "1": menu
     */
    type MenuType = '0' | '1';

    type MenuButton = {
      /**
       * button code
       *
       * it can be used to control the button permission
       */
      code: string;
      /** button description */
      desc: string;
    };

    /**
     * icon type
     *
     * - "1": iconify icon
     * - "2": local icon
     */
    type IconType = '1' | '2';

    type MenuPropsOfRoute = Pick<
      import('vue-router').RouteMeta,
      | 'i18nKey'
      | 'keepAlive'
      | 'constant'
      | 'order'
      | 'href'
      | 'hideInMenu'
      | 'activeMenu'
      | 'multiTab'
      | 'fixedIndexInTab'
      | 'query'
    >;

    type Menu = Common.CommonRecord<{
      /** parent menu id */
      parentId: number;
      /** menu type */
      menuType: MenuType;
      /** menu name */
      menuName: string;
      /** route name */
      routeName: string;
      /** route path */
      routePath: string;
      /** component */
      component?: string;
      /** iconify icon name or local icon name */
      icon: string;
      /** icon type */
      iconType: IconType;
      /** buttons */
      buttons?: MenuButton[] | null;
      /** children menu */
      children?: Menu[] | null;
    }> &
      MenuPropsOfRoute;

    /** menu list */
    type MenuList = Common.PaginatingQueryRecord<Menu>;

    type MenuTree = {
      id: number;
      label: string;
      pId: number;
      children?: MenuTree[];
    };
  }
}
