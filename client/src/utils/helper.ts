class Helper {
    static dataURLtoFile = (dataurl: string) => {
        let arr = dataurl.split(',')
        // @ts-ignore
        let mime = arr[0].match(/:(.*?);/)[1]
        let bstr = atob(arr[1])
        let n = bstr.length
        let u8arr = new Uint8Array(n)
        while(n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new File([u8arr], 'photo.'+mime.split('/')[1], {type:mime})
    }
}

export default Helper