(function () {
'use strict';

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var InverseKinematics = /** @class */ (function (_super) {
    __extends(InverseKinematics, _super);
    function InverseKinematics() {
        var _this = _super.call(this) || this;
        _this._faceDir = 0;
        _this._aimRadian = 0.0;
        _this._offsetRotation = 0.0;
        _this._target = new PIXI.Point();
        _this._resources.push("resource/mecha_1406/mecha_1406_ske.json", "resource/mecha_1406/mecha_1406_tex.json", "resource/mecha_1406/mecha_1406_tex.png", "resource/floor_board/floor_board_ske.json", "resource/floor_board/floor_board_tex.json", "resource/floor_board/floor_board_tex.png");
        return _this;
    }
    InverseKinematics.prototype._onStart = function () {
        var _this = this;
        //
        this.interactive = true;
        var touchHandler = function (event) {
            _this._target.x = event.data.global.x - _this.x;
            _this._target.y = event.data.global.y - _this.y;
        };
        this.addListener("touchmove", touchHandler, this);
        this.addListener("mousemove", touchHandler, this);
        PIXI.ticker.shared.add(this._enterFrameHandler, this);
        //
        var factory = dragonBones.PixiFactory.factory;
        factory.parseDragonBonesData(this._pixiResources["resource/mecha_1406/mecha_1406_ske.json"].data);
        factory.parseTextureAtlasData(this._pixiResources["resource/mecha_1406/mecha_1406_tex.json"].data, this._pixiResources["resource/mecha_1406/mecha_1406_tex.png"].texture);
        factory.parseDragonBonesData(this._pixiResources["resource/floor_board/floor_board_ske.json"].data);
        factory.parseTextureAtlasData(this._pixiResources["resource/floor_board/floor_board_tex.json"].data, this._pixiResources["resource/floor_board/floor_board_tex.png"].texture);
        //
        this._armatureDisplay = factory.buildArmatureDisplay("mecha_1406");
        this._floorBoard = factory.buildArmatureDisplay("floor_board");
        //
        this._chestBone = this._armatureDisplay.armature.getBone("chest");
        this._leftFootBone = this._armatureDisplay.armature.getBone("foot_l");
        this._rightFootBone = this._armatureDisplay.armature.getBone("foot_r");
        this._circleBone = this._floorBoard.armature.getBone("circle");
        this._floorBoardBone = this._floorBoard.armature.getBone("floor_board");
        //
        this._armatureDisplay.animation.play("idle");
        this._aimState = this._armatureDisplay.animation.fadeIn("aim", 0.1, 1, 0, "aim_group");
        this._aimState.resetToPose = false;
        this._aimState.stop();
        //
        this._floorBoard.animation.play("idle");
        this._floorBoard.armature.getSlot("player").display = this._armatureDisplay;
        this._floorBoard.x = 0.0;
        this._floorBoard.y = 50.0;
        this.addChild(this._floorBoard);
        //
        DragHelper.getInstance().stage = this;
        DragHelper.getInstance().enableDrag(this._floorBoard.armature.getSlot("circle").display);
        //
        this.createText("Touch to drag circle to modify IK bones.");
    };
    InverseKinematics.prototype._enterFrameHandler = function (deltaTime) {
        this._updateAim();
        this._updateFoot();
    };
    InverseKinematics.prototype._updateAim = function () {
        var positionX = this._floorBoard.x;
        var positionY = this._floorBoard.y;
        var aimOffsetY = this._chestBone.global.y * this._floorBoard.scale.y;
        this._faceDir = this._target.x > 0.0 ? 1 : -1;
        this._armatureDisplay.armature.flipX = this._faceDir < 0;
        if (this._faceDir > 0) {
            this._aimRadian = Math.atan2(this._target.y - positionY - aimOffsetY, this._target.x - positionX);
        }
        else {
            this._aimRadian = Math.PI - Math.atan2(this._target.y - positionY - aimOffsetY, this._target.x - positionX);
            if (this._aimRadian > Math.PI) {
                this._aimRadian -= Math.PI * 2.0;
            }
        }
        // Calculate progress.
        var progress = Math.abs((this._aimRadian + Math.PI / 2) / Math.PI);
        // Set currentTime.
        this._aimState.currentTime = progress * (this._aimState.totalTime);
    };
    InverseKinematics.prototype._updateFoot = function () {
        // Set floor board bone offset.
        var minRadian = -25 * dragonBones.Transform.DEG_RAD;
        var maxRadian = 25.0 * dragonBones.Transform.DEG_RAD;
        var circleRadian = Math.atan2(this._circleBone.global.y, this._circleBone.global.x);
        if (this._circleBone.global.x < 0.0) {
            circleRadian = dragonBones.Transform.normalizeRadian(circleRadian + Math.PI);
        }
        this._offsetRotation = Math.min(Math.max(circleRadian, minRadian), maxRadian);
        this._floorBoardBone.offset.rotation = this._offsetRotation;
        this._floorBoardBone.invalidUpdate();
        // Set foot bone offset.
        var tan = Math.tan(this._offsetRotation);
        var sinR = 1.0 / Math.sin(Math.PI * 0.5 - this._offsetRotation) - 1.0;
        this._leftFootBone.offset.y = tan * this._leftFootBone.global.x + this._leftFootBone.origin.y * sinR;
        this._leftFootBone.offset.rotation = this._offsetRotation * this._faceDir;
        this._leftFootBone.invalidUpdate();
        this._rightFootBone.offset.y = tan * this._rightFootBone.global.x + this._rightFootBone.origin.y * sinR;
        this._rightFootBone.offset.rotation = this._offsetRotation * this._faceDir;
        this._rightFootBone.invalidUpdate();
    };
    return InverseKinematics;
}(BaseDemo));

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW52ZXJzZUtpbmVtYXRpY3MudHMiLCJzb3VyY2VzIjpbIkludmVyc2VLaW5lbWF0aWNzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEludmVyc2VLaW5lbWF0aWNzIGV4dGVuZHMgQmFzZURlbW8ge1xuICAgIHByaXZhdGUgX2ZhY2VEaXI6IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBfYWltUmFkaWFuOiBudW1iZXIgPSAwLjA7XG4gICAgcHJpdmF0ZSBfb2Zmc2V0Um90YXRpb246IG51bWJlciA9IDAuMDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF90YXJnZXQ6IFBJWEkuUG9pbnQgPSBuZXcgUElYSS5Qb2ludCgpO1xuICAgIHByaXZhdGUgX2FybWF0dXJlRGlzcGxheTogZHJhZ29uQm9uZXMuUGl4aUFybWF0dXJlRGlzcGxheTtcbiAgICBwcml2YXRlIF9mbG9vckJvYXJkOiBkcmFnb25Cb25lcy5QaXhpQXJtYXR1cmVEaXNwbGF5O1xuICAgIHByaXZhdGUgX2NoZXN0Qm9uZTogZHJhZ29uQm9uZXMuQm9uZTtcbiAgICBwcml2YXRlIF9sZWZ0Rm9vdEJvbmU6IGRyYWdvbkJvbmVzLkJvbmU7XG4gICAgcHJpdmF0ZSBfcmlnaHRGb290Qm9uZTogZHJhZ29uQm9uZXMuQm9uZTtcbiAgICBwcml2YXRlIF9jaXJjbGVCb25lOiBkcmFnb25Cb25lcy5Cb25lO1xuICAgIHByaXZhdGUgX2Zsb29yQm9hcmRCb25lOiBkcmFnb25Cb25lcy5Cb25lO1xuICAgIHByaXZhdGUgX2FpbVN0YXRlOiBkcmFnb25Cb25lcy5BbmltYXRpb25TdGF0ZTtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLl9yZXNvdXJjZXMucHVzaChcbiAgICAgICAgICAgIFwicmVzb3VyY2UvbWVjaGFfMTQwNi9tZWNoYV8xNDA2X3NrZS5qc29uXCIsXG4gICAgICAgICAgICBcInJlc291cmNlL21lY2hhXzE0MDYvbWVjaGFfMTQwNl90ZXguanNvblwiLFxuICAgICAgICAgICAgXCJyZXNvdXJjZS9tZWNoYV8xNDA2L21lY2hhXzE0MDZfdGV4LnBuZ1wiLFxuICAgICAgICAgICAgXCJyZXNvdXJjZS9mbG9vcl9ib2FyZC9mbG9vcl9ib2FyZF9za2UuanNvblwiLFxuICAgICAgICAgICAgXCJyZXNvdXJjZS9mbG9vcl9ib2FyZC9mbG9vcl9ib2FyZF90ZXguanNvblwiLFxuICAgICAgICAgICAgXCJyZXNvdXJjZS9mbG9vcl9ib2FyZC9mbG9vcl9ib2FyZF90ZXgucG5nXCJcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgX29uU3RhcnQoKTogdm9pZCB7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgICBjb25zdCB0b3VjaEhhbmRsZXIgPSAoZXZlbnQ6IFBJWEkuaW50ZXJhY3Rpb24uSW50ZXJhY3Rpb25FdmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fdGFyZ2V0LnggPSBldmVudC5kYXRhLmdsb2JhbC54IC0gdGhpcy54O1xuICAgICAgICAgICAgdGhpcy5fdGFyZ2V0LnkgPSBldmVudC5kYXRhLmdsb2JhbC55IC0gdGhpcy55O1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFkZExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIHRvdWNoSGFuZGxlciwgdGhpcyk7XG4gICAgICAgIHRoaXMuYWRkTGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdG91Y2hIYW5kbGVyLCB0aGlzKTtcbiAgICAgICAgUElYSS50aWNrZXIuc2hhcmVkLmFkZCh0aGlzLl9lbnRlckZyYW1lSGFuZGxlciwgdGhpcyk7XG4gICAgICAgIC8vXG4gICAgICAgIGNvbnN0IGZhY3RvcnkgPSBkcmFnb25Cb25lcy5QaXhpRmFjdG9yeS5mYWN0b3J5O1xuICAgICAgICBmYWN0b3J5LnBhcnNlRHJhZ29uQm9uZXNEYXRhKHRoaXMuX3BpeGlSZXNvdXJjZXNbXCJyZXNvdXJjZS9tZWNoYV8xNDA2L21lY2hhXzE0MDZfc2tlLmpzb25cIl0uZGF0YSk7XG4gICAgICAgIGZhY3RvcnkucGFyc2VUZXh0dXJlQXRsYXNEYXRhKHRoaXMuX3BpeGlSZXNvdXJjZXNbXCJyZXNvdXJjZS9tZWNoYV8xNDA2L21lY2hhXzE0MDZfdGV4Lmpzb25cIl0uZGF0YSwgdGhpcy5fcGl4aVJlc291cmNlc1tcInJlc291cmNlL21lY2hhXzE0MDYvbWVjaGFfMTQwNl90ZXgucG5nXCJdLnRleHR1cmUpO1xuICAgICAgICBmYWN0b3J5LnBhcnNlRHJhZ29uQm9uZXNEYXRhKHRoaXMuX3BpeGlSZXNvdXJjZXNbXCJyZXNvdXJjZS9mbG9vcl9ib2FyZC9mbG9vcl9ib2FyZF9za2UuanNvblwiXS5kYXRhKTtcbiAgICAgICAgZmFjdG9yeS5wYXJzZVRleHR1cmVBdGxhc0RhdGEodGhpcy5fcGl4aVJlc291cmNlc1tcInJlc291cmNlL2Zsb29yX2JvYXJkL2Zsb29yX2JvYXJkX3RleC5qc29uXCJdLmRhdGEsIHRoaXMuX3BpeGlSZXNvdXJjZXNbXCJyZXNvdXJjZS9mbG9vcl9ib2FyZC9mbG9vcl9ib2FyZF90ZXgucG5nXCJdLnRleHR1cmUpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLl9hcm1hdHVyZURpc3BsYXkgPSBmYWN0b3J5LmJ1aWxkQXJtYXR1cmVEaXNwbGF5KFwibWVjaGFfMTQwNlwiKTtcbiAgICAgICAgdGhpcy5fZmxvb3JCb2FyZCA9IGZhY3RvcnkuYnVpbGRBcm1hdHVyZURpc3BsYXkoXCJmbG9vcl9ib2FyZFwiKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5fY2hlc3RCb25lID0gdGhpcy5fYXJtYXR1cmVEaXNwbGF5LmFybWF0dXJlLmdldEJvbmUoXCJjaGVzdFwiKTtcbiAgICAgICAgdGhpcy5fbGVmdEZvb3RCb25lID0gdGhpcy5fYXJtYXR1cmVEaXNwbGF5LmFybWF0dXJlLmdldEJvbmUoXCJmb290X2xcIik7XG4gICAgICAgIHRoaXMuX3JpZ2h0Rm9vdEJvbmUgPSB0aGlzLl9hcm1hdHVyZURpc3BsYXkuYXJtYXR1cmUuZ2V0Qm9uZShcImZvb3RfclwiKTtcbiAgICAgICAgdGhpcy5fY2lyY2xlQm9uZSA9IHRoaXMuX2Zsb29yQm9hcmQuYXJtYXR1cmUuZ2V0Qm9uZShcImNpcmNsZVwiKTtcbiAgICAgICAgdGhpcy5fZmxvb3JCb2FyZEJvbmUgPSB0aGlzLl9mbG9vckJvYXJkLmFybWF0dXJlLmdldEJvbmUoXCJmbG9vcl9ib2FyZFwiKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5fYXJtYXR1cmVEaXNwbGF5LmFuaW1hdGlvbi5wbGF5KFwiaWRsZVwiKTtcbiAgICAgICAgdGhpcy5fYWltU3RhdGUgPSB0aGlzLl9hcm1hdHVyZURpc3BsYXkuYW5pbWF0aW9uLmZhZGVJbihcImFpbVwiLCAwLjEsIDEsIDAsIFwiYWltX2dyb3VwXCIpO1xuICAgICAgICB0aGlzLl9haW1TdGF0ZS5yZXNldFRvUG9zZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9haW1TdGF0ZS5zdG9wKCk7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuX2Zsb29yQm9hcmQuYW5pbWF0aW9uLnBsYXkoXCJpZGxlXCIpO1xuICAgICAgICB0aGlzLl9mbG9vckJvYXJkLmFybWF0dXJlLmdldFNsb3QoXCJwbGF5ZXJcIikuZGlzcGxheSA9IHRoaXMuX2FybWF0dXJlRGlzcGxheTtcbiAgICAgICAgdGhpcy5fZmxvb3JCb2FyZC54ID0gMC4wO1xuICAgICAgICB0aGlzLl9mbG9vckJvYXJkLnkgPSA1MC4wO1xuICAgICAgICB0aGlzLmFkZENoaWxkKHRoaXMuX2Zsb29yQm9hcmQpO1xuICAgICAgICAvL1xuICAgICAgICBEcmFnSGVscGVyLmdldEluc3RhbmNlKCkuc3RhZ2UgPSB0aGlzO1xuICAgICAgICBEcmFnSGVscGVyLmdldEluc3RhbmNlKCkuZW5hYmxlRHJhZyh0aGlzLl9mbG9vckJvYXJkLmFybWF0dXJlLmdldFNsb3QoXCJjaXJjbGVcIikuZGlzcGxheSk7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuY3JlYXRlVGV4dChcIlRvdWNoIHRvIGRyYWcgY2lyY2xlIHRvIG1vZGlmeSBJSyBib25lcy5cIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZW50ZXJGcmFtZUhhbmRsZXIoZGVsdGFUaW1lOiBudW1iZXIpOiB2b2lkIHsgLy8gTWFrZSBzdXJlIGdhbWUgdXBkYXRlIGJlZm9yZSBkcmFnb25Cb25lcyB1cGRhdGUuXG4gICAgICAgIHRoaXMuX3VwZGF0ZUFpbSgpO1xuICAgICAgICB0aGlzLl91cGRhdGVGb290KCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfdXBkYXRlQWltKCk6IHZvaWQge1xuICAgICAgICBjb25zdCBwb3NpdGlvblggPSB0aGlzLl9mbG9vckJvYXJkLng7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uWSA9IHRoaXMuX2Zsb29yQm9hcmQueTtcbiAgICAgICAgY29uc3QgYWltT2Zmc2V0WSA9IHRoaXMuX2NoZXN0Qm9uZS5nbG9iYWwueSAqIHRoaXMuX2Zsb29yQm9hcmQuc2NhbGUueTtcblxuICAgICAgICB0aGlzLl9mYWNlRGlyID0gdGhpcy5fdGFyZ2V0LnggPiAwLjAgPyAxIDogLTE7XG4gICAgICAgIHRoaXMuX2FybWF0dXJlRGlzcGxheS5hcm1hdHVyZS5mbGlwWCA9IHRoaXMuX2ZhY2VEaXIgPCAwO1xuXG4gICAgICAgIGlmICh0aGlzLl9mYWNlRGlyID4gMCkge1xuICAgICAgICAgICAgdGhpcy5fYWltUmFkaWFuID0gTWF0aC5hdGFuMih0aGlzLl90YXJnZXQueSAtIHBvc2l0aW9uWSAtIGFpbU9mZnNldFksIHRoaXMuX3RhcmdldC54IC0gcG9zaXRpb25YKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2FpbVJhZGlhbiA9IE1hdGguUEkgLSBNYXRoLmF0YW4yKHRoaXMuX3RhcmdldC55IC0gcG9zaXRpb25ZIC0gYWltT2Zmc2V0WSwgdGhpcy5fdGFyZ2V0LnggLSBwb3NpdGlvblgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2FpbVJhZGlhbiA+IE1hdGguUEkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9haW1SYWRpYW4gLT0gTWF0aC5QSSAqIDIuMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbGN1bGF0ZSBwcm9ncmVzcy5cbiAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBNYXRoLmFicygodGhpcy5fYWltUmFkaWFuICsgTWF0aC5QSSAvIDIpIC8gTWF0aC5QSSk7XG4gICAgICAgIC8vIFNldCBjdXJyZW50VGltZS5cbiAgICAgICAgdGhpcy5fYWltU3RhdGUuY3VycmVudFRpbWUgPSBwcm9ncmVzcyAqICh0aGlzLl9haW1TdGF0ZS50b3RhbFRpbWUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3VwZGF0ZUZvb3QoKTogdm9pZCB7XG4gICAgICAgIC8vIFNldCBmbG9vciBib2FyZCBib25lIG9mZnNldC5cbiAgICAgICAgY29uc3QgbWluUmFkaWFuID0gLTI1ICogZHJhZ29uQm9uZXMuVHJhbnNmb3JtLkRFR19SQUQ7XG4gICAgICAgIGNvbnN0IG1heFJhZGlhbiA9IDI1LjAgKiBkcmFnb25Cb25lcy5UcmFuc2Zvcm0uREVHX1JBRDtcbiAgICAgICAgbGV0IGNpcmNsZVJhZGlhbiA9IE1hdGguYXRhbjIodGhpcy5fY2lyY2xlQm9uZS5nbG9iYWwueSwgdGhpcy5fY2lyY2xlQm9uZS5nbG9iYWwueCk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2NpcmNsZUJvbmUuZ2xvYmFsLnggPCAwLjApIHtcbiAgICAgICAgICAgIGNpcmNsZVJhZGlhbiA9IGRyYWdvbkJvbmVzLlRyYW5zZm9ybS5ub3JtYWxpemVSYWRpYW4oY2lyY2xlUmFkaWFuICsgTWF0aC5QSSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9vZmZzZXRSb3RhdGlvbiA9IE1hdGgubWluKE1hdGgubWF4KGNpcmNsZVJhZGlhbiwgbWluUmFkaWFuKSwgbWF4UmFkaWFuKTtcbiAgICAgICAgdGhpcy5fZmxvb3JCb2FyZEJvbmUub2Zmc2V0LnJvdGF0aW9uID0gdGhpcy5fb2Zmc2V0Um90YXRpb247XG4gICAgICAgIHRoaXMuX2Zsb29yQm9hcmRCb25lLmludmFsaWRVcGRhdGUoKTtcbiAgICAgICAgLy8gU2V0IGZvb3QgYm9uZSBvZmZzZXQuXG4gICAgICAgIGNvbnN0IHRhbiA9IE1hdGgudGFuKHRoaXMuX29mZnNldFJvdGF0aW9uKTtcbiAgICAgICAgY29uc3Qgc2luUiA9IDEuMCAvIE1hdGguc2luKE1hdGguUEkgKiAwLjUgLSB0aGlzLl9vZmZzZXRSb3RhdGlvbikgLSAxLjA7XG5cbiAgICAgICAgdGhpcy5fbGVmdEZvb3RCb25lLm9mZnNldC55ID0gdGFuICogdGhpcy5fbGVmdEZvb3RCb25lLmdsb2JhbC54ICsgdGhpcy5fbGVmdEZvb3RCb25lLm9yaWdpbi55ICogc2luUjtcbiAgICAgICAgdGhpcy5fbGVmdEZvb3RCb25lLm9mZnNldC5yb3RhdGlvbiA9IHRoaXMuX29mZnNldFJvdGF0aW9uICogdGhpcy5fZmFjZURpcjtcbiAgICAgICAgdGhpcy5fbGVmdEZvb3RCb25lLmludmFsaWRVcGRhdGUoKTtcblxuICAgICAgICB0aGlzLl9yaWdodEZvb3RCb25lLm9mZnNldC55ID0gdGFuICogdGhpcy5fcmlnaHRGb290Qm9uZS5nbG9iYWwueCArIHRoaXMuX3JpZ2h0Rm9vdEJvbmUub3JpZ2luLnkgKiBzaW5SO1xuICAgICAgICB0aGlzLl9yaWdodEZvb3RCb25lLm9mZnNldC5yb3RhdGlvbiA9IHRoaXMuX29mZnNldFJvdGF0aW9uICogdGhpcy5fZmFjZURpcjtcbiAgICAgICAgdGhpcy5fcmlnaHRGb290Qm9uZS5pbnZhbGlkVXBkYXRlKCk7XG4gICAgfVxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUE7SUFBZ0MscUNBQVE7SUFjcEM7UUFBQSxZQUNJLGlCQUFPLFNBVVY7UUF4Qk8sY0FBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixnQkFBVSxHQUFXLEdBQUcsQ0FBQztRQUN6QixxQkFBZSxHQUFX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LEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3JHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDMUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVuQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3hHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDM0UsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUN2QztJQUNMLHdCQUFDO0NBQUEsQ0E1SCtCLFFBQVEsR0E0SHZDOzs7OyJ9