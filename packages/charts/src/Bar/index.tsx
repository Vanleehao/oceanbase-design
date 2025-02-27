import React, { forwardRef } from 'react';
import type { BarConfig as AntBarConfig } from '@ant-design/charts';
import { Bar as AntBar } from '@ant-design/charts';
import { theme } from '../theme';
import { toPercent } from '../util/number';

export interface BarConfig extends AntBarConfig {
  // 是否为进度条形图，数值范围为 0 ~ 1
  isProgress?: boolean;
  // 警告水位线，仅 isProgress 为 true 时生效
  warningPercent?: number;
  // 危险水位线，仅 isProgress 为 true 时生效
  dangerPercent?: number;
}

const Bar: React.FC<BarConfig> = forwardRef(
  (
    {
      data,
      xField,
      meta,
      isStack,
      isGroup,
      isPercent,
      isRange,
      isProgress,
      warningPercent,
      dangerPercent,
      seriesField,
      label,
      barBackground,
      xAxis,
      yAxis,
      legend,
      ...restConfig
    },
    ref
  ) => {
    const stackValues =
      (isStack &&
        seriesField &&
        data?.filter(item => item[seriesField]).map(item => item[seriesField])) ||
      [];
    // 堆叠柱状图中最后一段对应的值
    const lastStackValue = stackValues?.[stackValues?.length - 1];
    const newConfig: BarConfig = {
      data,
      xField,
      isStack,
      isGroup,
      isPercent,
      isRange,
      seriesField,
      maxBarWidth: theme.barWidth,
      minBarWidth: theme.barWidth,
      meta: isProgress
        ? {
            ...meta,
            [xField]: {
              formatter: v => `${toPercent(v)}%`,
              ...meta?.[xField],
            },
          }
        : meta,
      // 仅基础条形图默认展示 label，位置为条形图右侧
      label:
        label !== false &&
        (isStack || isGroup || isRange
          ? label
          : {
              position: 'right',
              offset: 8,
              formatter: isProgress ? datum => `${toPercent(datum[xField])}%` : undefined,
              ...label,
            }),
      // 设置条形样式
      barStyle: datum => {
        let color;
        if (isProgress) {
          if (dangerPercent && datum[xField] >= dangerPercent) {
            color = theme.semanticRed;
          } else if (warningPercent && datum[xField] >= warningPercent) {
            color = theme.semanticYellow;
          }
        }

        return {
          ...(color
            ? {
                fill: color,
              }
            : {}),
          radius:
            // 区间条形图左右两侧均有 2px 圆角
            isRange
              ? 2
              : !isStack ||
                (isStack &&
                  seriesField &&
                  // 堆叠条形图仅最后一段末端展示 2px 圆角
                  datum[seriesField] === lastStackValue)
              ? [2, 2, 0, 0]
              : [],
        };
      },
      xAxis: {
        max: isProgress ? 1 : undefined,
        nice: true,
        ...xAxis,
      },
      barBackground: isProgress
        ? {
            ...barBackground,
            style: {
              fill: theme.barBackgroundColor,
              ...barBackground?.style,
            },
          }
        : barBackground,
      yAxis: yAxis !== false && {
        ...yAxis,
        // y 方向增加虚线网格
        grid: {
          ...yAxis?.grid,
          line: {
            ...yAxis?.grid?.line,
            style: {
              lineWidth: theme.styleSheet.axisGridBorder,
              stroke: theme.styleSheet.axisGridBorderColor,
              lineDash: [4, 4],
              ...yAxis?.grid?.line?.style,
            },
          },
        },
      },
      legend: legend !== false && {
        position: 'bottom-left',
        offsetX: 30,
        ...legend,
        marker: {
          symbol: 'circle',
          ...legend?.marker,
        },
      },
      theme: 'ob',
      ...restConfig,
    };
    return <AntBar {...newConfig} ref={ref} />;
  }
);

export default Bar;
