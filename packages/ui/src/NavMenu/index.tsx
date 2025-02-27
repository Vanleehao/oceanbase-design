import { Menu } from '@oceanbase/design';
import { isArray } from 'lodash';
import { pathToRegexp } from 'path-to-regexp';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getPrefix } from '../_util';
import useHistory from '../_util/useHistory';
import './index.less';

const prefix = getPrefix('menu');

export interface IMenu {
  key: string;
  title: string;
  link: string;
  disabled?: boolean;
  openNewTab?: boolean; // 不在本应用内打开
  href?: boolean;
  id?: string;
  children?: IMenu[];
}

interface MenuProps {
  menuList: IMenu[];
  className?: string;
  style?: React.CSSProperties;
}

export default (props: MenuProps) => {
  const { menuList, className, style } = props;
  const [selectedKeys, setSelectedKeys] = useState(['0']);
  const [menus, setMenus] = useState([]);
  const location = useLocation();

  const history = useHistory();

  const preProcess = useCallback(
    list => {
      const { pathname } = location;
      try {
        for (let i = 0; i < list.length; i++) {
          const { link, openNewTab, href, key, children } = list[i];
          const linkList = isArray(link) ? link : [link];
          const match = linkList.some(lk =>
            // pathToRegexp 不支持 http/https 协议解析，需要去掉协议头
            pathToRegexp(lk.replace(/^https?:\/\//, '')).test(pathname)
          );
          if (match) {
            if (openNewTab || href) return false;
            setSelectedKeys([key]);
            setMenus(list);
            return;
          }
          if (!!children?.length) {
            preProcess(children);
          }
        }
      } catch (error) {
        console.log('error', error);
      }
    },
    [location]
  );

  useEffect(() => {
    preProcess(menuList);
  }, [menuList, preProcess]);

  const onMenuItemSelect = useCallback(
    payload => {
      const { selectedKeys: newSelectedKeys } = payload;
      // 打开新tab类型的不需要设置选中态
      if (menus.some(i => i.key === newSelectedKeys[0] && i.openNewTab)) return;
      setSelectedKeys(newSelectedKeys);
    },
    [setSelectedKeys, menus]
  );

  const onMenuClick = useCallback(
    link => {
      const linkList = isArray(link) ? link : [link];
      history.push(linkList[0]);
    },
    [history]
  );

  return (
    <div className={`${prefix}-container ${className}`} style={style}>
      <Menu
        style={{ height: '100%', borderRight: 0 }}
        defaultSelectedKeys={['0']}
        selectedKeys={selectedKeys}
        onSelect={onMenuItemSelect}
        mode="inline"
        theme="light"
      >
        {menus.map(config => {
          return (
            <Menu.Item key={config.key} disabled={config.disabled ?? false}>
              {config.openNewTab ? (
                <a id={config.id} href={config.link} target="_blank" rel="noreferrer">
                  {config.title}
                </a>
              ) : (
                <a id={config.id} onClick={() => onMenuClick(config.link)}>
                  {config.title}
                </a>
              )}
            </Menu.Item>
          );
        })}
      </Menu>
    </div>
  );
};
