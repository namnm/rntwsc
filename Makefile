###############################################################################
# dev utils

extract:
	@export NEXT_PUBLIC_MINIFY_CLASS_NAMES=1 \
	&& node ./babel-extract;

###############################################################################
# clean

clean:
	@make clean_rm \
	&& pnpm ci && pnpm dedupe \
	&& cd ./playground \
	&& cd ./ios \
	&& pod install --repo-update \
	&& cd ../android && ./gradlew clean;

clean_rm:
	@cd ./playground \
	&& rm -rf \
		./ios/build \
		./ios/Pods \
		./ios/Podfile.lock \
		~/Library/Developer/Xcode/DerivedData \
		./android/.gradle \
		./android/app/.cxx \
		./android/build;

clean_deep:
	@make clean_deep_rm \
	&& pnpm ci && pnpm dedupe \
	&& cd ./playground \
	&& cd ./ios \
	&& pod cache clean --all \
	&& pod deintegrate \
	&& pod install --repo-update \
	&& cd ../android \
	&& ./gradlew clean;

clean_deep_rm:
	@make clean_rm \
	&& rm -rf \
		~/Library/Caches/CocoaPods \
		~/.gradle/caches \
		~/.gradle/daemon \
		$$TMPDIR/react-native* \
		$$TMPDIR/metro* \
		$$TMPDIR/haste-map*;

###############################################################################
# fmt

fmt:
	@pnpm fmt \
	&& make fmt_objc \
	&& make fmt_swift \
	&& make fmt_java \
	&& make fmt_kotlin \
	&& make fmt_xml;

fmt_objc:
	@export EXT="h|m" \
	&& make git-ls \
	| xargs clang-format-11 -i -style=file;
fmt_swift:
	@export EXT="swift" \
	&& make git-ls \
	| xargs swiftformat --quiet;
fmt_java:
	@export EXT="java" \
	&& make git-ls \
	| xargs google-java-format -i;
fmt_kotlin:
	@export EXT="kt" \
	&& make git-ls \
	| xargs ktfmt --quiet -i;
fmt_xml:
	@export EXT="storyboard|xcscheme|xcworkspacedata" \
	&& make git-ls \
	| xargs pnpm dlx prettier --parser=xml --log-level=error --write;

imagemin:
	@export EXT="png|jpg|gif|ico" \
	&& make git-ls \
	| xargs -L1 bash -c 'imagemin $$0 --out-dir $$(dirname $$0)';
git-ls:
	@bash -c 'comm -3 <(git ls-files) <(git ls-files -d)' \
	| egrep -h '\.($(EXT))$$';
