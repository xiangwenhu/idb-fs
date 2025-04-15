
# 基于indexedDB和promise的文件系统
<br/>
## 如何使用
<pre>
    window.onload = async function () {

        let fs = await FileSystem.getInstance()           
        let dir = await fs.root.getDirectory('测试文件夹1')
        let file = await fs.root.getFile('测试文件1')
        await file.write('我爱北京天安门')   
        file.readAsText().then(content => console.log(content))
        
    }
</pre>



