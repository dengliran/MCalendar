# MCalendar
一个移动端可多选的日历插件

#### 初始化
```
...
<input id="dome-input" type="text">

<script type="text/javascript">
  MCalendar('#dome-input');
<script>
...

```

#### API
MCalendar(selector[, option]);  
参数`option`是可选的，下面是该参数可选的属性。  

|属性       |类型   |默认值        |描述|
|--------       |---      |---            |---
|callback       |function |function(date){}  | 日期选择完成确认后触发，并把已选的日期以字符串参数传入
|clearBtn       |Boolean  |false             | 是否添加清除已选日期的按钮

```
...
<div class="dome-div"><div>
<script type="text/javascript">
  MCalendar('.dome-div',{
    callback: function(val){
      console.log(val)
    },
    clearBtn: true
  });
<script>
...
```
